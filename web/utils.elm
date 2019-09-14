module Utils exposing (..)

import Element exposing (Color, rgb255)

grey : Int -> Color
grey i = rgb255 i i i

white = grey 255

blue = rgb255 33 150 243
