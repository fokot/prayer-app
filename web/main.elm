import Browser
import List
--import Html exposing (Html, button, div, text, ul, li)
import Html.Events exposing (onClick)

import Element exposing (Element, column, el, text, row, alignLeft, alignRight, fill, width, rgb255, spacing, centerY, centerX, padding)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font

main =
    Element.layout []
      (
      row [ width fill, centerY, spacing 30 ]
              [ prayersPanel
              , myElement
              ]
              )

prayersPanel = column [ alignLeft, padding 30 ]
                      [ (text "aaa"), (text "bbb"), (text "ccc") ]

myRowOfStuff : Element msg
myRowOfStuff =
    row [ width fill, centerY, spacing 30 ]
        [ myElement
        , myElement
        , el [ alignRight ] myElement
        ]


myElement : Element msg
myElement =
    el
        [ Background.color (rgb255 240 0 245)
        , Font.color (rgb255 255 255 255)
        , Border.rounded 3
        , padding 30
        ]
        (text "stylish!")

--
--main =
--  Browser.sandbox { init = init, update = update, view = view }
--
--
---- MODEL
--
--type alias Prayer =
--  { id   : String
--  , name : String
--  , text : String
--  }
--
--type alias Model =
--  { prayers: List Prayer
--  , openPrayer: Prayer
--  }
--
--init : Model
--init =
--  {
--  prayers = [
--    {id = "1", name = "11", text = "111"},
--    {id = "2", name = "22", text = "222"}
--  ],
--  openPrayer = {id = "1", name = "11", text = "111"}
--  }
--
---- UPDATE
--
--type Msg = OpenPrayer Prayer
--
--update : Msg -> Model -> Model
--update msg model =
--  case msg of
--    OpenPrayer p -> { model | openPrayer = p }
--
--
--
---- VIEW
--
--view : Model -> Html Msg
--view model =
--  div []
--    [ ul [] (List.map prayer model.prayers)
--    , div [] [ text ("full text" ++ model.openPrayer.name) ]
--    ]
--
--
--prayer : Prayer -> Html Msg
--prayer p =
--  li []
--    [ div [ onClick (OpenPrayer p)] [ text p.name ] ]
