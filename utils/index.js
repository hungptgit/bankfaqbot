'use strict';
const createResponse = (intent, movie) => {
  if(movie.Response === 'True') {
    let {
      Title,
      Year,
      Plot,
      Director,
      Actors,
      Poster
    } = movie;

    switch(intent) {
      case 'movieInfo' : {
        let str = 'Da tra ve thong tin phu hop';
        return {
          text: str,
          image: Poster
        }
      }

      default: {
        return {
          text: "Always at your service :)",
          image: null
        }
      }
    }
  } else {
    return {
      text: "I don't seem to understand your question!",
      image: null
    }
  }
}

module.exports = createResponse;
