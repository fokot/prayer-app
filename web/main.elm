port module Main exposing (..)

import Browser
import Element.Border exposing (rounded)
import Element.Font as Font
import Html exposing (Html)
import Html.Attributes
import Http
import Element exposing (Attribute, Element, centerX, centerY, column, fill, height, padding, px, rgb255, row, spacing, width)
import DnDList
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import List.Extra exposing (find)
import Model exposing (Prayer, maybeGet, prayerEncode)
import PrayerEdit
import PrayerList
import Platform.Sub as Sub
import Platform.Cmd as Cmd
import Model exposing (Model, addPrayer, maybeExists)
import QRCode
import Tuple exposing (mapSecond)
import Element.Input
import Random
import Uuid exposing (uuidGenerator, Uuid)
import Time
import Element.Background as Background
import Element.Border as Border


-- MAIN

port wsSend : Encode.Value -> Cmd msg
port wsReceive : (Encode.Value -> msg) -> Sub msg

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \m -> Sub.batch
          [ (PrayerList.subscriptions >> Sub.map PrayerListMsg) m
          , statusPolling
          , wsReceive convertWsToMsg
          ]
        }


statusPolling : Sub Msg
statusPolling = Time.every 100000 (\_ -> Tick)


convertWsToMsg : Encode.Value -> Msg
convertWsToMsg v =
  let res = Decode.decodeValue incomingMsgDecoder v
  in
    case res of
      Err _ -> Noop
      Ok m -> WsIncoming m

u : String -> Uuid
u id = id |> Uuid.fromString |> maybeGet

initialModel : Model
initialModel =
  {
  dnd = PrayerList.system.model,
  prayers = [
    {id = u "2c8ad631-3944-4208-a1c4-53533f56f10d" , name = "1", text = "1", favorite = False},
    {id = u "30932625-5359-448c-84a4-1a268180b11e", name = "2", text = "2", favorite = False},
    {id = u "b2f1b200-6f90-430d-beb3-12756c5bd12d", name = "3", text = "3", favorite = False},
    {id = u "73b950be-027a-41d2-a994-531e0ea040d7", name = "4", text = "4", favorite = False},
    {id = u "2a2d1611-c1ee-4431-a6a5-a1ff6ec246ff", name = "5", text = "5", favorite = False}
  ],
  favorites = [],
  openPrayer = Nothing,
  clientId = Nothing,
  appConnected = False,
  errors = []
  }

init : () -> ( Model, Cmd Msg )
init _ =
  ( initialModel
  , Http.get
      { url = "http://localhost:3000/newClientId"
      , expect = Http.expectString Connect
      }
  )

-- UPDATE

type Msg
  =  PrayerListMsg PrayerList.Msg
  | PrayerEditMsg PrayerEdit.Msg
  | New
  | NewRandomId Uuid
  | Load
  | Loaded (Result Http.Error (List Prayer))
  | Save
  | Connect (Result Http.Error String)
  | AppStatus (Result Http.Error Bool)
  | Tick
  | Noop
  | WsIncoming IncomingMsg

type IncomingMsg = WsClientId String | WsPrayers (List Prayer) | WsClosed

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
    if s == "closed"
    then Decode.succeed WsClosed
    else Decode.fail <| "unknown message: " ++ s
  )

noop : a -> Msg
noop _ = Noop

errStr : Http.Error -> String
errStr e = case e of
  Http.BadUrl _ -> "BadUrl"
  Http.Timeout -> "Timeout"
  Http.NetworkError -> "NetworkError"
  Http.BadStatus _ -> "BadStatus"
  Http.BadBody s -> "BadBody: " ++ s

withClientId : Model -> (String -> Cmd Msg) -> Cmd Msg
withClientId model f = model.clientId |> Maybe.map f |> Maybe.withDefault Cmd.none

postJson
  : { url : String
    , body : Encode.Value
    , expect : Http.Expect msg
    }
  -> Cmd msg
postJson r =
  Http.request
    { method = "POST"
    , headers =
      [ Http.header "Access-Control-Allow-Headers" "x-requested-with"
      ]
    , url = r.url
    , body = Http.jsonBody r.body
    , expect = r.expect
    , timeout = Nothing
    , tracker = Nothing
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
  case message of
    PrayerListMsg m ->
      PrayerList.update m model |> mapSecond (Cmd.map PrayerListMsg)
    PrayerEditMsg m -> (PrayerEdit.update m model, Cmd.none)
    New ->
      case find (\p -> String.isEmpty p.name) model.prayers of
        Just p -> ({model | openPrayer = Just p}, Cmd.none)
        Nothing -> (model, Random.generate NewRandomId uuidGenerator)
    NewRandomId id -> (addPrayer id model, Cmd.none)
    Load -> (model, wsSend <| Encode.string "load")
    Loaded res ->
      case res of
       Err e -> ({model | errors = [errStr e]}, Cmd.none)
       Ok prayers -> ({model | prayers = prayers, favorites = List.filter .favorite prayers, openPrayer = Nothing }, Cmd.none)
    Save -> (model, withClientId model (\clientId ->
      postJson (
      { url = "http://localhost:3000/" ++ clientId
      , expect = Http.expectWhatever noop
      , body = Encode.list prayerEncode model.prayers
      })))
    Connect clientIdRes ->
      case clientIdRes of
        Err _ -> (model, Cmd.none)
        Ok clientId -> ({ model | clientId = Just clientId }, Cmd.none)
    Tick -> (model, withClientId model (\clientId ->
      Http.get (
      { url = "http://localhost:3000/" ++ clientId ++ "/status"
      , expect = Http.expectJson AppStatus Decode.bool
      })))
    AppStatus res ->
      case res of
        Err _ -> ({ model | appConnected = False }, Cmd.none)
        Ok connected -> ({ model | appConnected = connected }, Cmd.none)
    Noop -> (model, Cmd.none)
    WsIncoming (WsClientId clientId) -> ({ model | clientId = Just clientId }, Cmd.none)
    WsIncoming WsClosed -> ({ model | clientId = Nothing }, Cmd.none)
    WsIncoming (WsPrayers prayers)  -> (
      { model | prayers = prayers
      , favorites = List.filter .favorite prayers
      , openPrayer = Nothing
      }
      , Cmd.none)


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
      [ Element.inFront (Element.map PrayerListMsg (PrayerList.ghostView model.dnd model.prayers))
      ]
      (
      column [ height fill ]
      [ column [] <| List.map Element.text model.errors
      , row [ spacing 5 ]
          [ button [Font.size 100] { onPress = Just New, label = Element.el [centerX, centerY] <| Element.text "+"}
          , button [ Background.color <| rgb255 255 255 255]
            { onPress = Just Load
            , label = Element.html <| Html.img [ Html.Attributes.src "/img/load.png", Html.Attributes.width 160, Html.Attributes.height 120] []
            }
          , button []
            { onPress = Just Save
            , label = Element.html <| Html.img [ Html.Attributes.src "/img/save.png", Html.Attributes.width 160, Html.Attributes.height 120] []
            }
          , clientIdView model.clientId model.appConnected
          ]
      , row [ width fill, centerY, spacing 30 ]
        [ Element.map PrayerListMsg (PrayerList.view model)
        , case model.openPrayer of
            Nothing -> Element.text "No prayer selected"
            Just p -> Element.map PrayerEditMsg (PrayerEdit.view p)
        ]
      ]
      )

clientIdView : Maybe String -> Bool -> Element msg
clientIdView code appConnected =
  case code of
    Just c ->
      Element.el [ Background.color <| if appConnected then rgb255 0 220 0 else rgb255 255 255 255 ]
        (qrCodeView c)
    Nothing -> Element.none

qrCodeView : String -> Element msg
qrCodeView message =
  QRCode.encode message
    |> Result.map QRCode.toSvg
    |> Result.withDefault
      (Html.text "Error while encoding to QRCode.")
    |> Element.html
