import Browser
import Html exposing (Html)
import Http
import Element exposing (Attribute, Element, centerX, centerY, column, fill, height, rgb255, row, spacing, width)
import DnDList
import List.Extra exposing (find)
import Model exposing (Prayer, maybeGet)
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

-- MAIN

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = \m -> Sub.batch [ (PrayerList.subscriptions >> Sub.map PrayerListMsg) m, statusPolling ]
        }

statusPolling : Sub Msg
statusPolling = Time.every 1000 (\_ -> Tick)

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
  appConnected = False
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
  | Save
  | Connect (Result Http.Error String)
  | AppStatus (Result Http.Error Bool)
  | Tick

stringToBool : String -> Bool
stringToBool s =
  case s of
    "true" -> True
    _      -> False


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
    Load -> (model, Cmd.none)
    Save -> (model, Cmd.none)
    Connect clientIdRes ->
      case clientIdRes of
        Err _ -> (model, Cmd.none)
        Ok clientId -> ({ model | clientId = Just clientId }, Cmd.none)
    Tick -> (model,
      model.clientId
      |> Maybe.map (\cid ->
        Http.get (
        { url = "http://localhost:3000/" ++ cid ++ "/status"
        , expect = Http.expectString (Result.map stringToBool >> AppStatus)
        })
      )
      |> Maybe.withDefault Cmd.none)
    AppStatus res ->
      case res of
        Err _ -> ({ model | appConnected = False }, Cmd.none)
        Ok connected -> ({ model | appConnected = connected }, Cmd.none)

-- VIEW

view : Model -> Html Msg
view model =
    Element.layout
      [ Element.inFront (Element.map PrayerListMsg (PrayerList.ghostView model.dnd model.prayers))
      ]
      (
      column [ height fill ]
      [ row [ spacing 30 ]
          [ Element.Input.button [] { onPress = Just New, label = Element.text "new"}
          , Element.Input.button [] { onPress = Just Load, label = Element.text "load"}
          , Element.Input.button [] { onPress = Just Save, label = Element.text "save"}
          ]
      , row [ width fill, centerY, spacing 30 ]
        [ Element.map PrayerListMsg (PrayerList.view model)
        , case model.openPrayer of
            Nothing -> Element.text "No prayer selected"
            Just p -> Element.map PrayerEditMsg (PrayerEdit.view p)
        ]
      , clientIdView model.clientId model.appConnected
      ]
      )

clientIdView : Maybe String -> Bool -> Element msg
clientIdView code appConnected =
  case code of
    Just c ->
      column [ Background.color <| if appConnected then rgb255 0 220 0 else rgb255 255 255 255 ]
        [ qrCodeView c
        , Element.el [ centerX ] <| Element.text c
        ]
    Nothing -> Element.none

qrCodeView : String -> Element msg
qrCodeView message =
  QRCode.encode message
    |> Result.map QRCode.toSvg
    |> Result.withDefault
      (Html.text "Error while encoding to QRCode.")
    |> Element.html
