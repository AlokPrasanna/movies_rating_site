import React, { useEffect } from 'react';
import { useApiContextId } from '../Components/ApiContexId/ApiContexId';
import axios from 'axios';

function SaveMovieId() {

  const {Id} = useApiContextId();

  useEffect(() => {
    const saveMovieId = async () => {
      try {
        console.log("Api context Id : ",Id);
        await axios.post("http://localhost:3001/add-new-movie-id", {Id:Id});
      } catch (error) {
        console.log("Save Movie Id Error:", error);
      }
    };

    saveMovieId();
  }, [Id]);

  return <div></div>;
}

export default SaveMovieId;
