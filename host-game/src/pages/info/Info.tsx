import { Link } from "react-router-dom"



const Info: React.FC = () => {
    return <div className="container">
        <Link to="/">back to home</Link>
        <br />
        <br />
        <h2>About this game</h2>
        <p>Paranormal Activities is a multiplatform multiplayer game, inspired by different Jackbox games. Where players can answer prompts on a main screen using their own phones.</p>
        <p>Check it out on Github:</p>
        <a href="https://github.com/juliankroes/paranormal-activities"><img src='https://github-readme-stats.vercel.app/api/pin/?username=juliankroes&repo=paranormal-activities&theme=shadow_red'></img></a>
        <br />
        <br />
        <h2>About me</h2>
        <p>I'm Julian, I am 18 years and studying computer science in the city of Leiden at the Univercity of applied sciences in the Netherlands.</p>
    </div>
}


export default Info