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
--      Sc.html $ mconcat ["<h1>Scotty, ", xx, " me up!</h1>"]
--      undefined
--    Sc.put "/:clientId" $ do
--      clientId <- Sc.param "clientId"
--      Sc.liftAndCatchIO $ sendToClient (LazyText.unpack clientId) stateRef (Text.pack "put")
--      Sc.html $ mconcat ["<h1>Put, ", clientId, "</h1>"]

httpApp :: Wai.Application
httpApp _ respond = respond $ Wai.responseLBS Http.status400 [] "Not a websocket request"

type ClientId = String
type Client   = (ClientId, WS.Connection)
type State    = [Client]

nextId :: State -> IO ClientId
nextId s =
  let ids = List.map fst s
  in  MLoops.iterateWhile (`elem` ids) (Random.randomRIO (0, 9999) <&> fourDigits)

fourDigits :: Int -> String
fourDigits = Printf.printf "%04d"

connectClient :: WS.Connection -> Concurrent.MVar State -> IO ClientId
connectClient conn stateRef = Concurrent.modifyMVar stateRef $ \state -> do
  clientId <- nextId state
  WS.sendTextData conn (Text.pack clientId) *> return ((clientId, conn) : state, clientId)

withoutClient :: ClientId -> State -> State
withoutClient clientId = List.filter ((/=) clientId . fst)

disconnectClient :: ClientId -> Concurrent.MVar State -> IO ()
disconnectClient clientId stateRef = Concurrent.modifyMVar_ stateRef $ \state ->
  return $ withoutClient clientId state

listen :: WS.Connection -> ClientId -> Concurrent.MVar State -> IO ()
listen conn clientId stateRef = Monad.forever $ do
  WS.receiveData conn >>= broadcast clientId stateRef

sendToClientWithResponse :: ClientId -> Concurrent.MVar State -> Text.Text -> IO Text.Text
sendToClientWithResponse clientId stateRef msg = do
  clients <- Concurrent.readMVar stateRef
  let conn = snd $ Maybe.fromJust $ List.find ((==) clientId . fst) clients
  WS.sendTextData conn msg
  WS.receiveData conn

broadcast :: ClientId -> Concurrent.MVar State -> Text.Text -> IO ()
broadcast clientId stateRef msg = do
  clients <- Concurrent.readMVar stateRef
  let otherClients = withoutClient clientId clients
  Monad.forM_ otherClients $ \(_, conn) ->
    WS.sendTextData conn msg


wsApp :: Concurrent.MVar State -> WS.ServerApp
wsApp stateRef pendingConn = do
  conn <- WS.acceptRequest pendingConn
  clientId <- connectClient conn stateRef
  WS.forkPingThread conn 30
  Exception.finally
    (listen conn clientId stateRef)
    (disconnectClient clientId stateRef)
