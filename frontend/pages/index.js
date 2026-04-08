import {useState,useEffect} from "react";
import axios from "axios";

export default function Home(){
  const [pages,setPages]=useState([]);
  const [airline,setAirline]=useState("");
  const [keyword,setKeyword]=useState("");

  const load=async()=>{
    const res=await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages`);
    setPages(res.data);
  }

  const generate=async()=>{
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/generate`,{airline,keyword});
    load();
  }

  useEffect(()=>{load()},[]);

  return(
    <div style={{padding:40}}>
      <h1>SEO Tool Dashboard</h1>

      <input placeholder="Airline" onChange={e=>setAirline(e.target.value)}/>
      <input placeholder="Keyword" onChange={e=>setKeyword(e.target.value)}/>
      <button onClick={generate}>Generate</button>

      {pages.map(p=>(
        <div key={p.slug}>{p.title}</div>
      ))}
    </div>
  )
}
