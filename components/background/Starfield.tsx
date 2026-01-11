"use client";

import React, { useEffect } from "react";

export function Starfield() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const numStars = 500;

    useEffect(() => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext("2d")!

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const stars = Array.from({ length: numStars }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.2,
        depth : Math.random() * 1.0,
        blur: Math.random() * 2.0,
      }))
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        stars.forEach(star => {
            star.x -= star.speed
            if (star.x < 0) {
                star.x = canvas.width
                star.y = Math.random() * canvas.height
            }
            ctx.beginPath()
            ctx.arc(star.x, star.y, star.radius * star.depth * star.blur, 0, Math.PI * 2)
            ctx.fillStyle = "white"
            ctx.fill()
        })
        requestAnimationFrame(animate)
    }
    animate()
    }, [])
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
}