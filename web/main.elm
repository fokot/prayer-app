import Browser
import List
import Html exposing (Html)
import Element exposing (Attribute, Element, column, el, text, row, alignLeft, alignRight, fill, width, rgb255, spacing, centerY, centerX, padding)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Events exposing (onClick)
import Debug exposing (log)
import Html.Events exposing (on)
import Html.Attributes exposing (attribute)
import Json.Decode as Json
import DnDList

-- MAIN

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


-- MODEL

type alias Prayer =
  { id   : String
  , name : String
  , text : String
  }

type alias Model =
  { dnd : DnDList.Model
  , prayers: List Prayer
  , openPrayer: Prayer
  }



initialModel : Model
initialModel =
  {
  dnd = system.model,
  prayers = [
    {id = "1", name = "11", text = "111"},
    {id = "2", name = "22", text = "222"},
    {id = "3", name = "3", text = "3"},
    {id = "4", name = "4", text = "4"},
    {id = "5", name = "5", text = "5"},
    {id = "6", name = "6", text = "6"},
    {id = "7", name = "7", text = "7"}
  ],
  openPrayer = {id = "1", name = "11", text = "111"}
  }

init : () -> ( Model, Cmd Msg )
init _ =
    ( initialModel, Cmd.none )


-- SYSTEM


config : DnDList.Config Prayer
config =
    { beforeUpdate = \_ _ list -> list
    , movement = DnDList.Free
    , listen = DnDList.OnDrag
    , operation = DnDList.Rotate
    }


system : DnDList.System Prayer Msg
system =
    DnDList.create config Drag

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    system.subscriptions model.dnd


-- UPDATE

type Msg = OpenPrayer Prayer | Drag DnDList.Msg

update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
  case message of
    OpenPrayer p -> ({ model | openPrayer = p }, Cmd.none)
    Drag msg ->
      let
          ( dnd, prayers ) =
              system.update msg model.dnd model.prayers
      in
      ( { model | dnd = dnd, prayers = prayers }
      , system.commands model.dnd
      )

-- VIEW

view : Model -> Html Msg
view model =
    Element.layout
      [ Element.inFront (ghostView model.dnd model.prayers)
      ]
      (
      row [ width fill, centerY, spacing 30 ]
              [ prayersPanel model
              , editPrayer model
              ]
              )

prayersPanel : Model -> Element Msg
prayersPanel model =
  column [ alignLeft, padding 30 ]
  (model.prayers |> List.indexedMap (prayerView model.dnd))

prayerItem : Prayer -> Element Msg
prayerItem p =
  el
    [ Background.color (rgb255 240 0 245)
    , Font.color (rgb255 255 255 255)
    , Border.rounded 3
    , padding 30
    ]
    (text p.name)

emptyItem : Element Msg
emptyItem =
  el
    [ Background.color (rgb255 70 70 70)
    , Border.rounded 3
    , padding 30
    ]
    (Element.none)

prayerView : DnDList.Model -> Int -> Prayer -> Element Msg
prayerView dnd index prayer =
  case system.info dnd of
    Just { dragIndex } ->
      if dragIndex /= index then
        Element.el
          (Element.htmlAttribute (Html.Attributes.id prayer.id)
            :: List.map Element.htmlAttribute (system.dropEvents index prayer.id)
          )
          (prayerItem prayer)
        else
          Element.el
            [ Element.htmlAttribute (Html.Attributes.id prayer.id) ]
            emptyItem
    Nothing ->
      Element.el
        (Element.htmlAttribute (Html.Attributes.id prayer.id)
          :: onClick (OpenPrayer prayer)
          :: List.map Element.htmlAttribute (system.dragEvents index prayer.id)
        )
        (prayerItem prayer)

ghostView : DnDList.Model -> List Prayer -> Element.Element Msg
ghostView dnd items =
  let
    maybeDragItem : Maybe Prayer
    maybeDragItem =
      system.info dnd
        |> Maybe.andThen (\{ dragIndex } -> items |> List.drop dragIndex |> List.head)
  in
  case maybeDragItem of
    Just item ->
      Element.el
        (List.map Element.htmlAttribute (system.ghostStyles dnd))
        (prayerItem item)

    Nothing ->
      Element.none


editPrayer : Model -> Element Msg
editPrayer model =  el [] (text model.openPrayer.name)
