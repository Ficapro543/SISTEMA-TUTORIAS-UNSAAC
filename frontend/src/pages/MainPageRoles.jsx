import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MainPageRoles() {
  const [roles, setRoles] = useState({});

  useEffect(()=>{
    const savedRoles = localStorage.getItem("userRoles");
    if(savedRoles){
      setRoles(JSON.parse(savedRoles));
    }
  },[]);

  return (
    <div>
      <h1>Bienvenido a MainPage</h1>
      <p>Tus roles actuales:</p>
      <pre>{JSON.stringify(roles, null, 2)}</pre>
    </div>
  );
}

export default MainPageRoles;