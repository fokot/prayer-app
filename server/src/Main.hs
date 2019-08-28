{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main where

import qualified Data.ByteString.Lazy           as LazyByteString
import qualified Data.ByteString.UTF8           as BSU
import qualified Data.Foldable                  as Foldable (find, traverse_)
import qualified Control.Concurrent             as Concurrent
import qualified Control.Exception              as Exception
import qualified Control.Monad                  as Monad
import qualified Control.Monad.Loops            as MLoops
import qualified Data.List                      as List
import qualified Data.Maybe                     as Maybe
import qualified Data.Text                      as Text (Text)
import qualified Data.Text.Lazy                 as LazyText
import           Data.Functor                      ((<&>), ($>))
import qualified Network.HTTP.Types             as Http
import qualified Network.Wai                    as Wai
import qualified Network.Wai.Handler.Warp       as Warp
import qualified Network.Wai.Handler.WebSockets as WS
import qualified Network.WebSockets             as WS
import qualified System.Random                  as Random
import qualified Text.Printf                    as Printf (printf)

type ClientId = String
type Tunnel   = (ClientId, WS.Connection, Maybe WS.Connection)
type State    = [Tunnel]

first (x, _, _) = x

byClientId :: ClientId -> Tunnel -> Bool
byClientId clientId (tid, _, _) = clientId == tid

main :: IO ()
main = do
  state <- Concurrent.newMVar $ []
  Warp.run 3000 $ WS.websocketsOr
    WS.defaultConnectionOptions
    (wsApp state)
    httpApp

httpApp :: Wai.Application
httpApp _ respond = respond $ Wai.responseLBS Http.status400 [] "Not a websocket request"

nextId :: Concurrent.MVar State -> IO ClientId
nextId s = do
  Concurrent.readMVar s >>= \state -> do
    let ids = map first state
    MLoops.iterateWhile (`elem` ids) (Random.randomRIO (0, 9999) <&> fourDigits)

fourDigits :: Int -> String
fourDigits = Printf.printf "%04d"

withoutClient :: ClientId -> State -> State
withoutClient clientId = List.filter ((/=) clientId . first)

wsApp :: Concurrent.MVar State -> WS.ServerApp
wsApp stateRef pendingConn = do
  let path = drop 1 $ BSU.toString $ WS.requestPath $ WS.pendingRequest pendingConn
  if path == "web"
    then do
      connWeb <- WS.acceptRequest pendingConn
      clientId <- nextId stateRef
      connectWeb connWeb clientId stateRef
      WS.forkPingThread connWeb 30
      Exception.finally
        (listenWeb connWeb clientId stateRef)
        (disconnectWeb clientId stateRef)
    else do
      state <- Concurrent.readMVar stateRef
      let clientId = path
      let tunnel = List.find (byClientId clientId) state
      case tunnel of
        Just t@(_, connWeb, Nothing) -> do
          connApp <- WS.acceptRequest pendingConn
          connectApp connApp stateRef t
          WS.forkPingThread connApp 30
          Exception.finally
            (listenApp connApp connWeb)
            (disconnectApp clientId stateRef)
        Just (_, _, Just _) ->
          WS.rejectRequest pendingConn $ BSU.fromString "Already connected"
        Nothing ->
          WS.rejectRequest pendingConn $ BSU.fromString "No such web app open"

connectWeb :: WS.Connection -> ClientId -> Concurrent.MVar State -> IO ()
connectWeb connWeb clientId stateRef = do
  WS.sendTextData connWeb $ BSU.fromString ("{\"id\":\"" ++  clientId ++ "\"}")
  Concurrent.modifyMVar_ stateRef (\state -> pure $ (clientId, connWeb, Nothing) : state)

connectApp :: WS.Connection -> Concurrent.MVar State -> Tunnel -> IO ()
connectApp connApp stateRef tunnel =
  Concurrent.modifyMVar_ stateRef (\state ->
    let (clientId, connWeb, _) = tunnel
        newTunnel =  (clientId, connWeb, Just connApp)
        newState  = foldl (\acc a -> (if first a == clientId then newTunnel else a) : acc ) [] state
    in
    pure newState
  )

receiveText :: WS.Connection -> IO Text.Text
receiveText = WS.receiveData

listenWeb :: WS.Connection -> ClientId -> Concurrent.MVar State -> IO ()
listenWeb connWeb clientId stateRef = Monad.forever $ do
  msg <- receiveText connWeb
  state <- Concurrent.readMVar stateRef
  let tunnel = List.find (byClientId clientId) state
  case tunnel of
    Just (_, _, Just connApp) -> WS.sendTextData connApp msg
    _ -> pure ()

listenApp :: WS.Connection -> WS.Connection -> IO ()
listenApp connApp connWeb = Monad.forever $
  receiveText connApp >>= WS.sendTextData connWeb

disconnectWeb :: ClientId -> Concurrent.MVar State -> IO ()
disconnectWeb clientId stateRef = Concurrent.modifyMVar_ stateRef $ \state -> do
  let (tunnels, newState) = List.partition (byClientId clientId) state
  Foldable.traverse_
    (\tunnel ->
      case tunnel of
        (_, _, Just connApp) -> WS.sendClose connApp (LazyText.pack "close") $> ()
        _ -> pure ()
    ) $ tunnels
  pure $ newState

disconnectApp :: ClientId -> Concurrent.MVar State -> IO ()
disconnectApp clientId stateRef = Concurrent.modifyMVar_ stateRef $ \state -> do
  let (tunnels, newState) = List.partition (byClientId clientId) state
  Foldable.traverse_ (\tunnel ->
    let (_, connWeb, _) = tunnel
    in WS.sendClose connWeb $ LazyText.pack "close") tunnels
  pure $ newState
