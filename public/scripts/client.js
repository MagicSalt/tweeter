/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
*/

// Creating a new tweet
const createTweetElement = (data) => {
  let newTweet = (`
                    <article class="tweet">
                    <header class="flex-container-row">
                      <div class="profile-pic-username flex-container-row">
                        <img src="${data.user.avatars}"/>
                        <p>${data.user.name}</p>
                      </div>
                      <p class="handle">${data.user.handle}</p>
                    </header>
                    <section class="tweet-content">
                      <p>${escape(data.content.text)}</p>
                    </section>
                    <footer>
                      <p class="time-created">${timeago.format(data.created_at)}</p>
                      <div>
                        <i class="fas fa-flag"></i>
                        <i class="fas fa-retweet"></i>
                        <i class="fas fa-heart"></i>
                      </div>
                    </footer>
                    </article>
                    `);
  return newTweet;
};

// Prepends array of tweets to the tweet-container section
const renderTweets = (data) => {

  // Emptying the tweet container so there are no duplicate tweets
  $('#tweet-container').empty();
  for (let tweet of data) {
    $('#tweet-container').prepend(createTweetElement(tweet));
  }
};

// Using an Ajax request to get the JSON, then pass the data through renderTweet as an async
const loadTweets = () => {
  $.ajax('/tweets', {method: 'GET'})
    .done((data) => {
      console.log('rendering tweets from database');
      renderTweets(data);
    })
    .fail((err) => {
      console.log('Error', err);
    })
};

// Prevent an XSS attack
const escape = (str) => {
  let div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};

// Tweet error codes
const newTweetError = (message) => {
  if (!message) {
    $('#new-tweet-err').hide();
  } else {
    $('#new-tweet-err-msg').text(message);
    $('#new-tweet-err').show();
    $('#tweet-text').focus();
  }
};

const closeError = () => {
  $('#new-tweet-err').hide();
  $('#new-tweet-err-msg').text('');
};

const toggleCreateTweet = () => {
  $('#new-tweet-form').slideToggle();
  $('#tweet-text').focus();
};

$(document).ready(function() {

  // Clicking on header will show/hide the tweet submission form
  $('nav #compose-tweet-btn').click(function() {
    toggleCreateTweet();
  });

  // Loads tweets from database on page load
  loadTweets();

  // Preventing default behaviour on form submission
  $('form').submit(function(event) {
    event.preventDefault();
    const tweetData = $(this).serialize();
    const charCount = Number($('output.counter').val());
    // If trying to submit an empty tweet
    if (charCount === 140) {
      newTweetError('Cannot submit an empty tweet!');
      return;
    // If trying to submit a tweet that exceeds the character limit
    } else if (charCount < 0) {
      newTweetError('Tweet is too long!');
      return;
    }
    // Happy path
    $.post('/tweets', tweetData).then(() => {
      loadTweets();
      closeError();
    });
  });
});