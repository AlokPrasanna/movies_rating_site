import '../../Style/MovieDetails.scss';
import React, { useEffect, useState, useCallback } from 'react';
import { useApiContextId } from '../../Components/ApiContexId/ApiContexId';
import StarRating from '../../Components/StarRating/StarRating';
import YouTube from 'react-youtube';
import { useParams } from 'react-router-dom';
import Head from '../../Components/Head/Head';
import Header from '../../Components/Header/Header';
import BodyContent from '../../Components/BodyContent/BodyContent';
import Footer from '../../Components/Footer/Footer';
import SaveMovieId from '../../SaveMovieId/SaveMovieId';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
const Key = localStorage.getItem('TMDBKey');

function MovieDetails() {
  const { MovieId } = useParams();
  const { setContextIdData } = useApiContextId();
  const MovieIdInt = parseInt(MovieId, 10);
  const [MovieDetails, setMovieDetails] = useState("");
  const [MovieVideo, setMovieVideo] = useState([]);
  const [Genres, setGenres] = useState([]);
  const [RunTime, setRunTime] = useState(0);
  const [MRV, setMRV] = useState(0);
  const [MovieRatings, setMovieRatings] = useState();
  const [NewFansCount, setNewFansCount] = useState();
  console.log("Movie Id : ", MovieIdInt);

  // Move the GetMovieDetails function inside the MovieDetails component
  // No need to wrap it with useCallback since it doesn't have dependencies
  const GetMovieDetails = () => {
    try {
      fetch(`https://api.themoviedb.org/3/movie/${MovieId}?api_key=${Key}`)
        .then((res) => res.json())
        .then((data) => setMovieDetails(data))
        .catch((err) => {
          console.error("Error! : ", err);
        });
    } catch (err) {
      console.error("Error! : ", err);
    }
  };

  const GetMovieViedo = useCallback(() => {
    try {
      fetch(`https://api.themoviedb.org/3/movie/${MovieId}/videos?api_key=${Key}`)
        .then((res) => res.json())
        .then((data) => setMovieVideo(data.results))
        .catch((err) => {
          console.error("Error! : ", err);
        });
    } catch (err) {
      console.error("Error! : ", err);
    }
  }, [MovieId]); 

  useEffect(() => {
    try {
      GetMovieDetails();
      GetMovieViedo();
      setContextIdData(MovieId);
    } catch (err) {
      console.error("Error! : ", err);
    }
  }, [MovieId]); 

  useEffect(() => {
    try {
      if (MovieDetails.genres) {
        setGenres(MovieDetails.genres);
      }
      ConvertRunTime(parseInt(MovieDetails.runtime, 10));
    } catch (err) {
      console.error("Error! : ", err);
    }
  }, [MovieDetails]);

  const ConvertRunTime = (runtime) => {
    console.log("runTime: ", runtime);

    // Calculate hours and minutes
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    // Construct the formatted string
    const formattedTime = `${hours}h ${minutes}m`;

    setRunTime(formattedTime);
  };

  console.log("Genres: ", Genres);

  const fetchMovieRatings = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/get-movie-ratings');
      const filteredRatings = response.data.filter((rating) => rating.movie_id === MovieIdInt);
      console.log("Filtered Rating: ", filteredRatings);

      try {
        if (filteredRatings.length > 0) {
          const RatingCount = filteredRatings.reduce((total, rating) => total + rating.rating_count, 0);
          const FansCount = filteredRatings.reduce((total, rating) => total + rating.fans_count, 0);
          setMovieRatings(RatingCount);
          setNewFansCount(FansCount);
          console.log("Rating Count: ", RatingCount);
          console.log("FansCount: ", FansCount);

          if (!isNaN(RatingCount) && !isNaN(FansCount) && FansCount !== 0) {
            const CalculateMRV = RatingCount / FansCount;
            console.log("Calculate MRV value: ", CalculateMRV);
            setMRV(CalculateMRV.toFixed(1));
          } else {
            setMRV(0);
            console.log("Rating null");
          }
        } else {
          console.log("No ratings found");
        }
      } catch (error) {
        console.error('Data Not Valid:', error);
      }
    } catch (error) {
      console.error('Error fetching movie ratings:', error);
    }
  }, [MovieId]);

  useEffect(() => {
    fetchMovieRatings();
  }, [MovieIdInt]);

  const handleRatingChange = async (newRating) => {
    try {
      console.log("New user rate: ", newRating);
      let CalNewRatings = newRating;
      CalNewRatings += MovieRatings;
      console.log("Movie Id: ", MovieId);
      console.log("Old Rating Value: ", MovieRatings);
      console.log("New raring value: ", CalNewRatings);
      console.log("Old Fans count: ", NewFansCount);
      let CalNewFansCount = NewFansCount;
      CalNewFansCount += 1;
      console.log("New fans Count: ", CalNewFansCount);

      await axios.put('http://localhost:3001/update-rating', {
        movieId: MovieIdInt,
        ratingValue: CalNewRatings,
        newFansCount: CalNewFansCount
      });

      fetchMovieRatings();
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };
  console.log("MRV value : ", MRV);
  return (
    <div className='movie-details'>
      <Head Title="Movie Details" />
      <Header />
      <BodyContent>
        <div className='movie'>
          <div className='left-side'>
            <span className='m-title'>{MovieDetails ? MovieDetails.title : " "}</span><br />
            <span className='m-releasedate-runtime'>{MovieDetails ? MovieDetails.release_date : " " }  ..  {RunTime ? RunTime : " "} </span>
            <div className='rating-part'>
              <div>MRV Rating:   {MRV !== 0 ? MRV : "Rate Me Please ;) "}</div>
              <div>Rating Count: {NewFansCount !== 0 ? NewFansCount : " "}</div>
              <div>Your Rating <StarRating onChange={handleRatingChange} /></div> 
            </div>
            <br />
          </div>
          <div className='right-side'>
            <img className='movie-image' src={`https://image.tmdb.org/t/p/original${MovieDetails && MovieDetails.poster_path}`} alt={MovieDetails.title}/>
          </div>
        </div><br />
      <div className='image-video'>
        
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop={true}
        >
          {MovieVideo &&
              MovieVideo.map((video) => (
                <YouTube
                  key={video.key}
                  videoId={video.key}
                  opts={{
                    width: '100%',
                    height: '600px',
                    playerVars: {
                      disablekb: 1,
                      modestbranding: 1,
                      showinfo: 0,
                      rel: 0,
                    },
                  }}
                />
              ))}
        </Carousel>   
      </div>
      <br />
      <div className='left-side'>
        <div className='genres' >
              {Genres && Genres.map((genre, index) => ( 
                  <span className='movie-detail-genre'>
                    {genre ? genre.name : " "}
                    {index !== Genres.length - 1 ? ' / ' : ''}
                  </span>
              ))}
              </div>
              {/*<span className='movie-language-details-page'>{MovieDetails ? MovieDetails.original_language : " "}</span>*/}
              <span className='m-overview'>{MovieDetails ? MovieDetails.overview : " "}</span><br />
        </div>
      </BodyContent><br />
      <Footer/>
      <SaveMovieId/>
      
      
    </div>
  );
}

export default MovieDetails;
