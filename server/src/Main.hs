{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main where

import qualified Data.ByteString.Lazy           as LazyByteString
import qualified Control.Concurrent             as Concurrent
import qualified Control.Exception              as Exception
import qualified Control.Monad                  as Monad
import qualified Control.Monad.Loops            as MLoops
import qualified Data.List                      as List
import qualified Data.Maybe                     as Maybe
import qualified Data.Text                      as Text
import qualified Data.Text.Lazy                 as LazyText
import qualified Data.Text.Encoding             as Encoding
import           Data.Functor                      ((<&>))
import qualified Network.HTTP.Types             as Http
import qualified Network.Wai                    as Wai
import qualified Network.Wai.Handler.Warp       as Warp
import qualified Network.Wai.Handler.WebSockets as WS
import qualified Network.WebSockets             as WS
import qualified Safe
import qualified System.Random                  as Random
import qualified Text.Printf                    as Printf (printf)
import qualified Web.Scotty                     as Sc
import Data.Monoid (mconcat)

type ClientId = String
type Message  = Text.Text
type Client   = (ClientId, WS.Connection, Concurrent.MVar Message)
type State    = [Client]

first  (x, _, _) = x
second (_, x, _) = x
third  (_, _, x) = x

main :: IO ()
main = do
  state <- Concurrent.newMVar []
  httpApp <- scottyApp state
  Warp.run 3000 $ WS.websocketsOr
    WS.defaultConnectionOptions
    (wsApp state)
    httpApp


scottyApp :: Concurrent.MVar State -> IO Wai.Application
scottyApp stateRef = do
  Sc.scottyApp $ do
    Sc.get "/:clientId" $ do
      clientId <- Sc.param "clientId"
      response <- Sc.liftAndCatchIO $ sendToClientWithResponse (LazyText.unpack clientId) stateRef (Text.pack "get")
      Sc.setHeader "Content-Type" "application/json"
      Sc.raw $ LazyByteString.fromStrict $ Encoding.encodeUtf8 response
    Sc.put "/:clientId" $ do
      clientId <- Sc.param "clientId"
      body <- Encoding.decodeUtf8 <$> LazyByteString.toStrict <$> Sc.body
      response <- Sc.liftAndCatchIO $ sendToClientWithResponse (LazyText.unpack clientId) stateRef body
      Sc.raw $ LazyByteString.fromStrict $ Encoding.encodeUtf8 response

nextId :: State -> IO ClientId
nextId s =
  let ids = List.map first s
  in  MLoops.iterateWhile (`elem` ids) (Random.randomRIO (0, 9999) <&> fourDigits)

fourDigits :: Int -> String
fourDigits = Printf.printf "%04d"

connectClient :: WS.Connection -> Concurrent.MVar State -> IO (ClientId, Concurrent.MVar Message)
connectClient conn stateRef = Concurrent.modifyMVar stateRef $ \state -> do
  clientId <- nextId state
  messageRef <- Concurrent.newEmptyMVar
  WS.sendTextData conn (Text.pack clientId) *> return ((clientId, conn, messageRef) : state, (clientId, messageRef))

withoutClient :: ClientId -> State -> State
withoutClient clientId = List.filter ((/=) clientId . first)

disconnectClient :: ClientId -> Concurrent.MVar State -> IO ()
disconnectClient clientId stateRef = Concurrent.modifyMVar_ stateRef $ \state ->
  return $ withoutClient clientId state

listen :: WS.Connection -> ClientId -> Concurrent.MVar Message -> IO ()
listen conn clientId messageRef = Monad.forever $ do
  WS.receiveData conn >>= Concurrent.putMVar messageRef

sendToClientWithResponse :: ClientId -> Concurrent.MVar State -> Text.Text -> IO Text.Text
sendToClientWithResponse clientId stateRef msg = do
  clients <- Concurrent.readMVar stateRef
  let (_, conn, messageRef) = Maybe.fromJust $ List.find ((==) clientId . first) clients
  WS.sendTextData conn msg
  Concurrent.takeMVar messageRef

wsApp :: Concurrent.MVar State -> WS.ServerApp
wsApp stateRef pendingConn = do
  conn <- WS.acceptRequest pendingConn
  (clientId, messageRef) <- connectClient conn stateRef
  WS.forkPingThread conn 30
  Exception.finally
    (listen conn clientId messageRef)
    (disconnectClient clientId stateRef)
