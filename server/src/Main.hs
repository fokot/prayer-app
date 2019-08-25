{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main where

import qualified Data.ByteString.Lazy           as LazyByteString
import qualified Data.ByteString.UTF8           as BSU
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
data State    = State {clients :: [Client], clientIds :: [ClientId]}

updateClients :: ([Client] -> [Client]) -> State -> State
updateClients f s = State (f $ clients s) (clientIds s)

updateClientIds :: ([ClientId] -> [ClientId]) -> State -> State
updateClientIds f s = State (clients s) (f $ clientIds s)

first  (x, _, _) = x

main :: IO ()
main = do
  state <- Concurrent.newMVar $ State [] []
  httpApp <- scottyApp state
  Warp.run 3000 $ WS.websocketsOr
    WS.defaultConnectionOptions
    (wsApp state)
    httpApp

setApplicationJsonHeader = Sc.setHeader "Content-Type" "application/json"
enableCorsHeader = Sc.setHeader "Access-Control-Allow-Origin" "*"

encodeBool :: Bool -> String
encodeBool b = if b then "true" else "false"


scottyApp :: Concurrent.MVar State -> IO Wai.Application
scottyApp stateRef = do
  Sc.scottyApp $ do
    Sc.get "/newClientId" $ do
      clientId <- Sc.liftAndCatchIO $ nextId stateRef
      setApplicationJsonHeader
      enableCorsHeader
      Sc.setHeader "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS"
      Sc.raw $ LazyByteString.fromStrict $ Encoding.encodeUtf8 $ Text.pack clientId
    Sc.options "/:clientId" $ do
      enableCorsHeader
      Sc.setHeader "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS"
    Sc.get "/:clientId" $ do
      enableCorsHeader
      Sc.setHeader "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS"
    Sc.post "/:clientId" $ do
      clientId <- Sc.param "clientId"
      body <- Encoding.decodeUtf8 <$> LazyByteString.toStrict <$> Sc.body
      response <- Sc.liftAndCatchIO $ sendToClientWithResponse (LazyText.unpack clientId) stateRef body
      setApplicationJsonHeader
      enableCorsHeader
      Sc.setHeader "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS"
      Sc.raw $ LazyByteString.fromStrict $ Encoding.encodeUtf8 response
    Sc.get "/:clientId/status" $ do
      clientId <- Sc.param "clientId"
      status <- Sc.liftAndCatchIO $ clientStatus clientId stateRef
      setApplicationJsonHeader
      enableCorsHeader
      Sc.setHeader "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS"
      Sc.raw $ LazyByteString.fromStrict $ Encoding.encodeUtf8 $ Text.pack (encodeBool status)



nextId :: Concurrent.MVar State -> IO ClientId
nextId s = do
  Concurrent.modifyMVar s $ \state -> do
    let ids = clientIds state
    clientId <- MLoops.iterateWhile (`elem` ids) (Random.randomRIO (0, 9999) <&> fourDigits)
    return (updateClientIds (clientId :) state, clientId)

fourDigits :: Int -> String
fourDigits = Printf.printf "%04d"

connectClient :: WS.Connection -> Concurrent.MVar State -> ClientId -> IO (Concurrent.MVar Message)
connectClient conn stateRef clientId = Concurrent.modifyMVar stateRef $ \state -> do
  messageRef <- Concurrent.newEmptyMVar
  return (State ((clientId, conn, messageRef) : clients state) (clientIds state), messageRef)

withoutClient :: ClientId -> State -> State
withoutClient clientId = updateClients $ List.filter ((/=) clientId . first)

disconnectClient :: ClientId -> Concurrent.MVar State -> IO ()
disconnectClient clientId stateRef = Concurrent.modifyMVar_ stateRef $ \state ->
  return $ withoutClient clientId state

listen :: WS.Connection -> ClientId -> Concurrent.MVar Message -> IO ()
listen conn clientId messageRef = Monad.forever $ do
  WS.receiveData conn >>= Concurrent.putMVar messageRef

clientStatus :: ClientId -> Concurrent.MVar State -> IO Bool
clientStatus clientId stateRef =
  Concurrent.readMVar stateRef <&> clients <&> map first <&> elem clientId

sendToClientWithResponse :: ClientId -> Concurrent.MVar State -> Text.Text -> IO Text.Text
sendToClientWithResponse clientId stateRef msg = do
  state <- Concurrent.readMVar stateRef
  let (_, conn, messageRef) = Maybe.fromJust $ List.find ((==) clientId . first) (clients state)
  WS.sendTextData conn msg
  Concurrent.takeMVar messageRef

wsApp :: Concurrent.MVar State -> WS.ServerApp
wsApp stateRef pendingConn = do
  let clientId = drop 1 $ BSU.toString $ WS.requestPath $ WS.pendingRequest pendingConn
  conn <- WS.acceptRequest pendingConn
  messageRef <- connectClient conn stateRef clientId
  WS.forkPingThread conn 30
  Exception.finally
    (listen conn clientId messageRef)
    (disconnectClient clientId stateRef)
