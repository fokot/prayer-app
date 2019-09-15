module Model exposing (..)

import Json.Decode as D exposing (Decoder, field)
import Json.Encode as E
import List
import DnDList
import Uuid exposing (Uuid)
import List.Extra as List

-- MODEL

type alias Prayer =
  { id       : Uuid
  , name     : String
  , text     : String
  , favorite : Bool
  }

uuidDecoder : Decoder Uuid
uuidDecoder = D.string |> D.andThen (\u ->
  case Uuid.fromString u of
    Just uuid -> D.succeed uuid
    Nothing -> D.fail <| u ++ " is not UUID"
  )

prayerDecoder : Decoder Prayer
prayerDecoder =
  D.map4 Prayer
    (field "id" uuidDecoder)
    (field "name" D.string)
    (field "text" D.string)
    (field "favorite" D.bool)

prayerEncode : Prayer -> E.Value
prayerEncode p = E.object
  [ ( "id", E.string <| Uuid.toString p.id )
  , ( "name", E.string p.name )
  , ( "text", E.string p.text )
  , ( "favorite", E.bool p.favorite )
  ]

type alias WindowSize =
  { width: Int
  , height: Int
  }

windowSizeDecoder : Decoder WindowSize
windowSizeDecoder =
  D.map2 WindowSize
    (field "width" D.int)
    (field "height" D.int)

type alias Model =
  { windowSize   : WindowSize
  , dnd          : DnDList.Model
  , prayers      : List Prayer
  , openPrayer   : Maybe Prayer
  , clientId     : Maybe String
  , appConnected : Bool
  , errors       : List String
  }

isSelected : Prayer -> Model -> Bool
isSelected prayer model = (model.openPrayer |> Maybe.map (\p -> p.id == prayer.id) |> Maybe.withDefault False)

getId : Prayer -> String
getId = .id >> Uuid.toString

emptyPrayer : Uuid -> Prayer
emptyPrayer id = { id = id, name = "", text = "", favorite = False }

updateWith : Prayer -> Prayer -> Prayer
updateWith newPrayer oldPrayer = if newPrayer.id == oldPrayer.id then newPrayer else oldPrayer

replacePrayer : Prayer -> List Prayer -> List Prayer
replacePrayer p ps =
  List.foldr (\ a acc -> updateWith p a :: acc) [] ps
--  List.foldr (\ a acc -> if a.id == p.id then p :: acc else a :: acc) [] ps

updatePrayer : Prayer -> Model -> Model
updatePrayer p model =
  let prayers = model.prayers
      openPrayer = model.openPrayer
  in
  { model | prayers = replacePrayer p prayers
          , openPrayer = Maybe.map (updateWith p) openPrayer
  }

maybeFilter : (a -> Bool) -> Maybe a -> Maybe a
maybeFilter f =
  Maybe.andThen (\a -> if f a then Just a else Nothing)

deletePrayer : Prayer -> Model -> Model
deletePrayer p model =
  let prayers = List.remove p model.prayers
      openPrayer = maybeFilter (\o -> o.id /= p.id) model.openPrayer
  in
  { model | prayers = prayers
          , openPrayer = openPrayer
  }

addPrayer : Uuid -> Model -> Model
addPrayer id model =
  let newPrayer = emptyPrayer id
      prayers = newPrayer :: model.prayers
      openPrayer = Just newPrayer
  in
  { model | prayers = prayers
          , openPrayer = openPrayer
  }
