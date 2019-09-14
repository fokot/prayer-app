port module Main exposing (..)

import Browser
import Element.Border exposing (rounded)
import Element.Font as Font
import Html exposing (Html)
import Html.Attributes
import Element exposing (Attribute, Element, alignRight, centerX, centerY, column, fill, height, htmlAttribute, padding, paddingXY, px, rgb255, row, spacing, width)
import DnDList
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import List.Extra as List
import Model exposing (Prayer, prayerEncode)
import PrayerEdit
import PrayerList
import Platform.Sub as Sub
import Platform.Cmd as Cmd
import Model exposing (Model, addPrayer)
import Model exposing (Model, addPrayer)
import QRCode
import Tuple exposing (mapSecond)
import Element.Input
import Random
import Utils exposing (blue, grey, white)
import Uuid exposing (uuidGenerator, Uuid)
import Element.Background as Background
import Element.Border as Border


-- MAIN

port wsSend    : Encode.Value -> Cmd msg
port wsReceive : (Encode.Value -> msg) -> Sub msg
port errorLog  : String -> Cmd msg

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \m -> Sub.batch
          [ (PrayerList.subscriptions >> Sub.map PrayerListMsg) m
          , wsReceive convertWsToMsg
          ]
        }

convertWsToMsg : Encode.Value -> Msg
convertWsToMsg v =
  let res = Decode.decodeValue incomingMsgDecoder v
  in
    case res of
      Err e -> Error <| "unknown ws message: " ++ Decode.errorToString e
      Ok m -> WsIncoming m

initialModel : Model
initialModel =
  {
  dnd = PrayerList.system.model,
  prayers = [],
  openPrayer = Nothing,
  clientId = Nothing,
  appConnected = False,
  errors = []
  }

init : () -> ( Model, Cmd Msg )
init _ = ( initialModel, Cmd.none )

-- UPDATE

type Msg
  =  PrayerListMsg PrayerList.Msg
  | PrayerEditMsg PrayerEdit.Msg
  | New
  | NewRandomId Uuid
  | Load
  | Save
  | WsIncoming IncomingMsg
  | Error String

type IncomingMsg = WsClientId String | WsPrayers (List Prayer) | WsClosed | WsTunnelOpen

incomingMsgDecoder : Decoder IncomingMsg
incomingMsgDecoder = Decode.oneOf [ wsClientIdDecoder, wsPrayersDecoder, wsClosedDecoder ]

wsClientIdDecoder : Decoder IncomingMsg
wsClientIdDecoder = Decode.field "id" Decode.string |> Decode.map WsClientId

wsPrayersDecoder : Decoder IncomingMsg
wsPrayersDecoder = Decode.list Model.prayerDecoder |> Decode.map WsPrayers

wsClosedDecoder : Decoder IncomingMsg
wsClosedDecoder =
  Decode.string
  |> Decode.andThen (\s ->
    case s of
      "closed" -> Decode.succeed WsClosed
      "tunnel-open" -> Decode.succeed WsTunnelOpen
      _        -> Decode.fail <| "unknown message: " ++ s
  )

update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
  case message of
    PrayerListMsg m ->
      PrayerList.update m model |> mapSecond (Cmd.map PrayerListMsg)
    PrayerEditMsg m -> (PrayerEdit.update m model, Cmd.none)
    New ->
      case List.find (\p -> String.isEmpty p.name) model.prayers of
        Just p -> ({model | openPrayer = Just p}, Cmd.none)
        Nothing -> (model, Random.generate NewRandomId uuidGenerator)
    NewRandomId id -> (addPrayer id model, Cmd.none)
    Load -> (model, wsSend <| Encode.string "load")
    Save ->
      if List.any (\p -> p.name == "") model.prayers
      then ({model | errors = ["Empty prayer name"]}, Cmd.none)
      else (model, wsSend <| Encode.list prayerEncode model.prayers)
    WsIncoming (WsClientId clientId) -> ({ model | clientId = Just clientId }, Cmd.none)
    WsIncoming WsClosed -> ({ model | clientId = Nothing, appConnected = False }, Cmd.none)
    WsIncoming WsTunnelOpen ->
      (
        { model | appConnected = True }
        , if List.isEmpty model.prayers then wsSend <| Encode.string "load" else Cmd.none
      )
    WsIncoming (WsPrayers prayers)  -> (
      { model | prayers = prayers
      , openPrayer = Nothing
      }
      , Cmd.none)
    Error e -> (model, errorLog e)

-- VIEW

button attrs a = Element.Input.button
  ( (width <| px 160)
  :: (height <| px 120)
  :: rounded 10
  :: padding 10
  :: Border.solid
  :: (Border.color <| rgb255 220 220 220)
  :: Border.width 2
  :: attrs
  ) a

view : Model -> Html Msg
view model =
    Element.layout
      [ Element.inFront (Element.map PrayerListMsg (PrayerList.ghostView model))
      , Element.inFront ( topbar model )
      , Background.color <| grey 248
      , padding 10
      , width fill
      ]
      (
      column [ height fill, paddingXY 0 150 ]
      [ Element.map PrayerListMsg (PrayerList.view model) ]
--      column [] <| List.map Element.text model.errors
--      , topbar model
--      , row [ width fill, alignTop, spacing 30 ]
      )

noPadding = padding 0

when : Bool -> Element Msg -> Element Msg
when p e = if p then e else Element.none

prayerEdit model =
-- Left and top needs to be set so it does not overlay over the list and list get mouse events
  Element.el [ htmlAttribute <| Html.Attributes.style "style" "left: 330px; top: 10px" ] <| case model.openPrayer of
    Nothing -> Element.none
    Just p -> Element.map PrayerEditMsg (PrayerEdit.view p)

topbar : Model -> Element Msg
topbar model =
  row [ paddingXY 10 0, height <| px 140, Background.color blue, width fill, spacing 10, Element.below <| prayerEdit model ]
    [ button [ noPadding, Font.size 100] { onPress = Just New, label = Element.el [centerX, centerY] <| Element.text "+"}
    , when model.appConnected <| button [ noPadding ]
      { onPress = Just Load
      , label = Element.html <| Html.img [ Html.Attributes.src "/img/load.png", Html.Attributes.width 160, Html.Attributes.height 120] []
      }
    , when model.appConnected <| button [ noPadding ]
      { onPress = Just Save
      , label = Element.html <| Html.img [ Html.Attributes.src "/img/save.png", Html.Attributes.width 160, Html.Attributes.height 120] []
      }
    , Element.el [ alignRight ] <| clientIdView model.clientId model.appConnected
    ]

clientIdView : Maybe String -> Bool -> Element msg
clientIdView code appConnected =
  if appConnected
  then Element.el [Font.size 32] (Element.text "Phone\nconnected")
  else case code of
    Just c ->
      Element.el [ Background.color white ]
        (qrCodeView c)
    Nothing -> Element.none

qrCodeView : String -> Element msg
qrCodeView message =
  QRCode.encode message
    |> Result.map (QRCode.toSvg >>  Element.html)
    |> Result.withDefault (Element.text "Error while encoding to QRCode.")
