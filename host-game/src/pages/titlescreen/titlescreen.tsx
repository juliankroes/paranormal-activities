import React from 'react'
import logo from '../../assets/images/paranormal-logo.png'
import './titlescreen.css'
import { useAnimate, stagger, motion } from "framer-motion"
import { Link } from 'react-router-dom'

const titlescreen: React.FC = () => {
    const list = {
        visible: {
          opacity: 1,
          transition: {
            when: "beforeChildren",
            staggerChildren: 0.3,
          },
        },
        hidden: {
          opacity: 0,
          transition: {
            when: "afterChildren",
          },
        },
    }

    const hover = {  
        scale: 1.2,
        transition: { duration: .05 }
    }
    
    const item = {
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: -10 },
    }
      
    return (
        <div className="d-flex justify-content-center background">
            <div>
                
                <motion.div 
                className='main-options' 
                variants={list}
                initial="hidden"
                animate="visible">
                    <motion.img 
                        src={logo} 
                        variants={item} 
                        alt="" 
                        className='main-logo'/>
                    <motion.button 
                        variants={item} 
                        whileHover={hover} 
                        
                        className='main-button'><Link className='unset' to="/lobby">play</Link></motion.button>
                    <motion.button 
                        variants={item} 
                        whileHover={hover} 
                        className='main-button'><Link className='unset' to="/settings">settings</Link></motion.button>
                    <motion.button 
                        variants={item} 
                        whileHover={hover} 
                        className='main-button'><Link className='unset' to="/info">info</Link></motion.button>
                    <motion.button 
                        variants={item} 
                        whileHover={hover} 
                        className='main-button'>quit</motion.button>
                </motion.div>
            </div>
        </div> 
    )
}


export default titlescreen