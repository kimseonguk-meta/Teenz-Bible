# Meme Fix Notes

## Current meme (meme_038.jpg)
- "GOD IS IN CONTROL DESPITE THE CIRCUMSTANCES" with worship band photo
- Not funny at all - just a generic worship photo with text overlay
- Need to replace with something actually funny/relatable for teens

## Solution
- The meme rotation is based on day of year (idx = dayOfYear % totalMemes)
- Today's index is 37 → meme_038.jpg
- Options:
  1. Replace meme_038.jpg with a funnier image
  2. Change the rotation logic to skip boring ones
  3. Add new funnier memes and adjust the list

## Button cutoff issue
- Bottom buttons on Home page are being cut off by the navigation bar
- Need to add padding-bottom to the home page content area
