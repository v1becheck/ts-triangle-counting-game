'use client'

export default function TriangleShape() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="triangle-svg"
      style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large outer triangle */}
      <polygon
        points="200,50 350,350 50,350"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />
      
      {/* Horizontal line dividing the triangle */}
      <line x1="50" y1="200" x2="350" y2="200" stroke="#000000" strokeWidth="2" />
      
      {/* Vertical line from top to base */}
      <line x1="200" y1="50" x2="200" y2="350" stroke="#000000" strokeWidth="2" />
      
      {/* Diagonal lines from top vertex to base */}
      <line x1="200" y1="50" x2="125" y2="350" stroke="#000000" strokeWidth="2" />
      <line x1="200" y1="50" x2="275" y2="350" stroke="#000000" strokeWidth="2" />
      
      {/* Diagonal lines from base corners to center */}
      <line x1="50" y1="350" x2="200" y2="200" stroke="#000000" strokeWidth="2" />
      <line x1="350" y1="350" x2="200" y2="200" stroke="#000000" strokeWidth="2" />
      
      {/* Additional diagonal lines creating more triangles */}
      <line x1="125" y1="200" x2="200" y2="350" stroke="#000000" strokeWidth="2" />
      <line x1="275" y1="200" x2="200" y2="350" stroke="#000000" strokeWidth="2" />
      
      {/* Lines from midpoints to create additional triangles */}
      <line x1="125" y1="350" x2="200" y2="200" stroke="#000000" strokeWidth="2" />
      <line x1="275" y1="350" x2="200" y2="200" stroke="#000000" strokeWidth="2" />
    </svg>
  )
}

