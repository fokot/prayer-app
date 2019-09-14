module PrayerList exposing (view, ghostView, update, subscriptions, Msg, system)

import Html
import Html.Events
import Json.Decode as Decode
import List
import Element exposing (Attribute, Element, alignLeft, alignRight, centerX, centerY, column, el, fill, height, padding, px, rgb255, row, scrollbarY, spacing, text, width)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Events exposing (onClick)
import Html.Attributes
import DnDList
import Model exposing (Model, Prayer, deletePrayer, getId, isSelected, updatePrayer)
import Utils exposing (grey)


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

type Msg =
  Open Prayer
  | Drag DnDList.Msg
  | ToggleFavorite Prayer
  | Delete Prayer

update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
  case message of
    Open p ->
      ({ model | openPrayer = Just p }, Cmd.none)
    Drag msg ->
      let
        ( dnd, prayers ) =
          system.update msg model.dnd model.prayers
      in
      ( { model | dnd = dnd, prayers = prayers }
      , system.commands model.dnd
      )
    ToggleFavorite p ->
      ( updatePrayer { p | favorite = not p.favorite } model, Cmd.none)
    Delete p ->
      ( deletePrayer p model, Cmd.none)

-- VIEW

view : Model -> Element Msg
view model =
  column [ alignLeft, width <| px 300, spacing 5 ]
  (model.prayers |> List.indexedMap (prayerView model))

nameView : Prayer -> String
nameView p =
  if String.length p.name < 30
  then p.name
  else String.slice 0 27 p.name ++ "..."

prayerItemSizeAtts : List (Attribute msg)
prayerItemSizeAtts =
  [ width fill
  , height <| px 60
  , padding 10
  ]

-- stop propagating events, otherwise it will send event also for background element
onCustomClick : msg -> Html.Attribute msg
onCustomClick msg =
  Html.Events.custom "click"
    (Decode.succeed
      { message = msg
      , stopPropagation = True
      , preventDefault = True
      }
    )

icon : List (Attribute msg) -> msg -> String -> Element msg
icon attrs msg class =
  Element.el attrs <| Element.html (Html.i [ onCustomClick msg, Html.Attributes.class class ] [])


prayerItem : Bool -> Prayer -> Element Msg
prayerItem selected p =
  row
  ([ Background.color (if selected then (rgb255 0 200 0) else (grey 248))
      , Font.color (if selected then (grey 255) else (grey 0))
      , Border.rounded 3
      , Border.solid
      , Border.width 1
      , Border.color <| grey 100
--      , Border.shadow { offset = ( 3, 3 )
--                          , size = 2
--                          , blur = 4
--                          , color = grey 100
--                          }
      ] ++ prayerItemSizeAtts
  )
  [ Element.paragraph [Font.size 16, centerY] [text <| nameView p]
  , row [ alignRight, centerY, height <| px 30, spacing 5]
    [ icon [] (Delete p) "fa fa-trash"
    , icon [] (ToggleFavorite p) (if p.favorite then "fas fa-star text-error" else "far fa-star")
    ]
  ]

prayerView : Model -> Int -> Prayer -> Element Msg
prayerView model index prayer =
  let selected = isSelected prayer model
  in case system.info model.dnd of
    Just { dragIndex } ->
      if dragIndex /= index then
        Element.el
          ((width fill) :: Element.htmlAttribute (Html.Attributes.id (getId prayer))
            :: List.map Element.htmlAttribute (system.dropEvents index (getId prayer))
          )
          (prayerItem selected prayer)
        else
          Element.el
            ( Background.color (grey 255)
            :: Border.rounded 3
            :: Border.dotted
            :: Border.width 1
            :: (Border.color <| grey 0)
            :: Element.htmlAttribute (Html.Attributes.id (getId prayer))
            :: prayerItemSizeAtts
            )
            Element.none
    Nothing ->
      Element.el
        ((width fill) :: Element.htmlAttribute (Html.Attributes.id (getId prayer))
          :: onClick (Open prayer)
          :: List.map Element.htmlAttribute (system.dragEvents index (getId prayer))
        )
        (prayerItem selected prayer)

ghostView : Model -> Element.Element Msg
ghostView model =
  let
    maybeDragItem : Maybe Prayer
    maybeDragItem =
      system.info model.dnd
        |> Maybe.andThen (\{ dragIndex } -> model.prayers |> List.drop dragIndex |> List.head)
  in
  case maybeDragItem of
    Just prayer ->
      Element.el
        (List.map Element.htmlAttribute (system.ghostStyles model.dnd))
        (prayerItem (isSelected prayer model) prayer)
    Nothing ->
      Element.none
