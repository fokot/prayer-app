module PrayerList exposing (view, ghostView, update, subscriptions, Msg, system)

import List
import Element exposing (Attribute, Element, column, el, text, row, alignLeft, alignTop, fill, width, rgb255, spacing, centerY, centerX, padding)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Events exposing (onClick)
import Html.Attributes
import DnDList
import Model exposing (Model, Prayer, getId)


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
    OpenPrayer p ->
      ({ model | openPrayer = Just p }, Cmd.none)
    Drag msg ->
      let
        ( dnd, prayers ) =
          system.update msg model.dnd model.prayers
      in
      ( { model | dnd = dnd, prayers = prayers }
      , system.commands model.dnd
      )

-- VIEW

view : Model -> Element Msg
view model =
  column [ alignLeft, padding 30 ]
  (model.prayers |> List.indexedMap (prayerView model))

prayerItem : Bool -> Prayer -> Element Msg
prayerItem selected p =
  el
    [ Background.color (if selected then (rgb255 0 255 0) else (rgb255 240 0 245))
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

prayerView : Model -> Int -> Prayer -> Element Msg
prayerView model index prayer =
  case system.info model.dnd of
    Just { dragIndex } ->
      if dragIndex /= index then
        Element.el
          (Element.htmlAttribute (Html.Attributes.id (getId prayer))
            :: List.map Element.htmlAttribute (system.dropEvents index (getId prayer))
          )
          (prayerItem False prayer)
        else
          Element.el
            [ Element.htmlAttribute (Html.Attributes.id (getId prayer)) ]
            emptyItem
    Nothing ->
      Element.el
        (Element.htmlAttribute (Html.Attributes.id (getId prayer))
          :: onClick (OpenPrayer prayer)
          :: List.map Element.htmlAttribute (system.dragEvents index (getId prayer))
        )
        (prayerItem (model.openPrayer |> Maybe.map (\p -> p.id == prayer.id) |> Maybe.withDefault False) prayer)

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
        (prayerItem False item)
    Nothing ->
      Element.none
