module Utils exposing (..)

import Element exposing (Color, px, rgb255)

simpleColor : Int -> Color
simpleColor i = rgb255 i i i

white = simpleColor 255
black = simpleColor 0
blue = rgb255 33 150 243
backgroundColor = simpleColor 220
grey = simpleColor 220
greyLight = simpleColor 248
greyDark = simpleColor 100
green = rgb255 0 200 0

space : Int
space = 10

spacePx = px space
