import Browser
import List
import Html exposing (Html)
import Element exposing (Element, column, el, text, row, alignLeft, alignRight, fill, width, rgb255, spacing, centerY, centerX, padding)
import Element.Background as Background
import Element.Border as Border
import Element.Font as Font
import Element.Events exposing (onClick)

main =
    Browser.sandbox
        { init = init
        , view = view
        , update = update
        }

-- MODEL

type alias Prayer =
  { id   : String
  , name : String
  , text : String
  }

type alias Model =
  { prayers: List Prayer
  , openPrayer: Prayer
  }

init : Model
init =
  {
  prayers = [
    {id = "1", name = "11", text = "111"},
    {id = "2", name = "22", text = "222"}
  ],
  openPrayer = {id = "1", name = "11", text = "111"}
  }

-- UPDATE

type Msg = OpenPrayer Prayer

update : Msg -> Model -> Model
update msg model =
  case msg of
    OpenPrayer p -> { model | openPrayer = p }

-- VIEW

view : Model -> Html Msg
view model =
    Element.layout []
      (
      row [ width fill, centerY, spacing 30 ]
              [ prayersPanel model
              , editPrayer model
              ]
              )

prayersPanel : Model -> Element Msg
prayersPanel model =
  column [ alignLeft, padding 30 ]
  (List.map prayer model.prayers)


prayer : Prayer -> Element Msg
prayer p =
  el
    [ Background.color (rgb255 240 0 245)
    , Font.color (rgb255 255 255 255)
    , Border.rounded 3
    , padding 30
    , onClick (OpenPrayer p)
    ]
    (text p.name)

editPrayer : Model -> Element Msg
editPrayer model =  el [] (text model.openPrayer.name)
