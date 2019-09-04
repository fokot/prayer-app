module Utils exposing (..)

-- sometimes necessary
import Element exposing (Color, rgb255)
import Uuid exposing (Uuid)
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

grey : Int -> Color
grey i = rgb255 i i i

u : String -> Uuid
u id = id |> Uuid.fromString |> maybeGet
