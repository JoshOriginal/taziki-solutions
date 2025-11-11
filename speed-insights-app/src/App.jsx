import React from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function App(){
  return (
    <div style={{padding:20,fontFamily:'Inter, sans-serif',color:'#0f172a'}}>
      <h1>Vercel Speed Insights (React)</h1>
      <p>Below is the <code>&lt;SpeedInsights /&gt;</code> component. Replace the <code>url</code> prop with your deployed site URL.</p>

      {/* Assumption: component accepts a `url` prop. Replace with correct props if needed. */}
      <div style={{marginTop:20}}>
        <SpeedInsights url="https://your-deployed-site.vercel.app" />
      </div>
    </div>
  )
}
