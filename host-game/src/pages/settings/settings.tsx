import { Link } from "react-router-dom"

interface settingProps {
    musicHandler: () => void
}
const Settings: React.FC<settingProps> = (props) => {
    const playMusic = () => {
        props.musicHandler()
    }
    return (
        <div className="d-flex container flex-column justify-content-center">
            <Link to="/">back to home</Link>
            <br />
            <h1>Settings</h1>
            <div>
                <button className="btn btn-primary" onClick={playMusic}>Start music</button>
            </div>
            <br />
            <label htmlFor="musicVolume" className="form-label">Music volume</label>
            <input type="range" className="form-range" id="musicVolume" />
            <label htmlFor="soundEffectVolume" className="form-label">Sound effect volume</label>
            <input type="range" className="form-range" id="soundEffectVolume" />
        </div>
    )
}

export default Settings
