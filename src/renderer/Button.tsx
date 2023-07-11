import React, { useEffect, useState } from 'react'
import pic_youtube from './youtube.png';
import pic_twitch from './twitch.png';
import pic_spotify from './spotify.png';
import pico from './Nico.png';
import { useNavigate } from 'react-router-dom'

interface Props {
    id: string;
  }

const ResizableButton: React.FC<Props> = (props) => {

    const [buttonHeight, setButtonHeight] = useState(0);
    const navigate = useNavigate();
    var pic = pico
    var link = "/nico"

    switch(props.id) {
        case "youtube": {
            pic = pic_youtube
            link = "/YT"
           break
        }
        case "twitch": {
            pic = pic_twitch
            link = "/twitch"
           break
        }
        case "spotify": {
            pic = pic_spotify
            link = "/spotify"
           break;
        }
        case "nico": {
            pic = pico
            link = "/nico"
           break;
        }
        default: {
            pic = pico
            link = "/nico"
           break;
        }
     }

    useEffect(() => {
        const handleResize = () => {
          const windowHeight = window.innerHeight;
          const buttonHeightPercentage = windowHeight * .5; // Adjust the percentage value as needed

          setButtonHeight(buttonHeightPercentage);
        };

        handleResize(); // Initial resize

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

      const handleButtonClick = () => {
        navigate(link)
      }

    return (
      <button className="ResizableButton"  style= {{height: `${buttonHeight}px`, width: `250px`}} onClick = {handleButtonClick}><img src={pic} style={{width: "200px", height: "200px" }}></img></button>
    );
  };

  export default ResizableButton;
