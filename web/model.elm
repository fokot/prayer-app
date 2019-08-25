module Model exposing (Prayer, Model, updatePrayer, emptyPrayer, addPrayer, getId, maybeGet, maybeExists, prayerDecoder)
import Json.Decode as JD exposing (Decoder, field)
import List
import DnDList
import Uuid exposing (Uuid)

-- MODEL

type alias Prayer =
  { id       : Uuid
  , name     : String
  , text     : String
  , favorite : Bool
  }

u : String -> Uuid
u id = id |> Uuid.fromString |> maybeGet

prayerDecoder : Decoder Prayer
prayerDecoder =
  JD.map4 Prayer
    (JD.map u <| field "id" JD.string)
    (field "name" JD.string)
    (field "text" JD.string)
    (field "favorite" JD.bool)

type alias Model =
  { dnd          : DnDList.Model
  , prayers      : List Prayer
  , favorites    : List Prayer
  , openPrayer   : Maybe Prayer
  , clientId     : Maybe String
  , appConnected : Bool
  , errors       : List String
  }

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
      favorites = model.favorites
      openPrayer = model.openPrayer
  in
  { model | prayers = replacePrayer p prayers
          , favorites = replacePrayer p favorites
          , openPrayer = Maybe.map (updateWith p) openPrayer
  }

maybeFilter : (a -> Bool) -> Maybe a -> Maybe a
maybeFilter f =
  Maybe.andThen (\a -> if f a then Just a else Nothing)

deletePrayer : Prayer -> Model -> Model
deletePrayer p model =
  let notPrayer : Prayer -> Bool
      notPrayer prayer = prayer.id /= p.id
      prayers = List.filter notPrayer model.prayers
      favorites = List.filter notPrayer model.favorites
      openPrayer = maybeFilter notPrayer model.openPrayer
  in
  { model | prayers = prayers
          , favorites = favorites
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

-- sometimes necessary
maybeGet : Maybe a -> a
maybeGet m =
  case m of
    Just a -> a
    Nothing -> Debug.todo "maybeGet"

maybeExists : (a -> Bool) -> Maybe a -> Bool
maybeExists f m =
  case m of
    Just a -> f a
    Nothing -> False
