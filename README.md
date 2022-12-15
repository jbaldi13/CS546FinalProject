**PROJECT OVERVIEW**

**Name:** DateSpot

**Developers:** John Baldi, Matthew Bayne, Haydn Dotterer, Michael Scoli

**Description:** A dating website that initially prompts users to select their dating preferences in which they will choose 3-10 interest categories that they enjoy going to or doing. Then, the website recommends people with compatible dating preferences to the user. Finally, after a match between users, it uses the Yelp Fusion API to recommend places nearby or upcoming events that fall under the mutually specified interest category selections for date ideas. For example, if both users like pop music, it could recommend upcoming pop concerts. Or if they both like coffee, it could recommend local coffee shops.

**Core Features:** Homepage, Onboarding Page, Dashboard, Instant Chat, Date Recommendation Section

**Extra Features:** Add and View Additional Photos, Ability to Unmatch with Users

**Services:** MongoDB, Google Cloud Platform

**GitHub Repo:** [https://github.com/jbaldi13/CS546FinalProject](https://github.com/jbaldi13/CS546FinalProject)  
** **
**INSTALL AND RUN PROJECT**

Make sure MongoDB is running on your machine.

Install SDK on your machine: [https://cloud.google.com/sdk/install](https://cloud.google.com/sdk/install)

Download the zip file and extract the files to a new folder on your machine.

Navigate to this folder on the command line.

**Install all dependencies:** npm install

**Set up Google Cloud:** gcloud auth application-default login

**Seed the database:** npm run seed

**Run the application:** npm start

**Open the application:** In your browser, go to http://localhost:3000/

The application should now be running and ready for use on your browser.

If you want to explore the features without creating an account, seed the database as shown above and login with the following credentials:

username: stevensstudent@gmail.com

password: Ilovecoding123!
** **
**CREATING AN ACCOUNT AND ONBOARDING**

On the homepage of the application, click the button in the middle of the screen "CREATE ACCOUNT".

Enter a valid email address. Email address is not case sensitive. Email must not already exist as a user.

Enter a valid password (specifications are listed on page). Password is case sensitive.

Confirm the password. Passwords must match in order to create account.

Click the button labeled "SUBMIT". You will be taken to another page to continue onboarding.

Enter your first name.

Enter your birthday in the form of mm/dd/yyyy.

Select your gender and choose if you want your gender to be shown on your profile.

Select your pronouns and choose if you want your pronouns to be shown on your profile.

Enter information about yourself.

Select 3-10 interests of yours. You must hold down the control button on your keyboard while clicking on each selection.

Click the button labeled "SUBMIT". You will be taken to another page to continue onboarding.

Click the button labeled "Allow location access". Click "Allow" on the browser pop-up if you get one.

Select the gender you are interested in.

Drag the slider to the minimum age you are interested in.

Drag the slider to the maximum age you are interested in.

Drag the slider to the maximum distance you are interested in.

Click the button labeled "SUBMIT". You will be taken to another page to continue onboarding.

Upload a profile picture.

Click the button labeled "SUBMIT". Onboarding is now complete and you will be brought to the dashboard.

Warning: Depending on the the settings you choose during onboarding, you might not have any compatible users on the dashboard page.
** **
**LOGGING IN AND SIGNING OUT**

On the homepage of the application, click the button in the middle of the screen "LOGIN".

Enter the email address associated with your account. Email address is not case sensitive.

Enter your password. Password is case sensitive.

Click the button labelled "LOGIN". If your credentials are correct, you will be brought to the dashboard.

Click the three lines in the top corner of the dashboard, and click "Sign Out" to sign out.
** **
**MATCHING WITH USERS AND MESSAGING**

Compatible users within your range will be displayed one at a time on the right hand side of the dashboard. If no users match your preferences within the range specified, the message "There's no one around you" will be displayed.

Click, drag, and release the image of the user to the left to dislike them.

Click, drag, and release the image of the user to the right to like them.

There will be a match if both you and the other user like each other.

Matches will be displayed on the left hand side of the dashboard.

Clicking on a user you have matched with will bring you to a page with their details displayed on the left hand side of the screen, and the date ideas displayed on the right hand side of the screen.

Click the button labeled "MESSAGE" to open the chat box and send the user a message. Press the enter button on your keyboard to send the message.

Click the drop down arrow under a date idea topic to display the relevant locations.
** **
**EDITING PROFILE AND UPDATING YOUR INFORMATION**

Click the three lines in the top right corner of the page to display the account options window.

Click "Edit Profile" to be brought to a page where you can edit your personal information.

Click "Update Filters" to be brought to a page where you can update your preferences.

Click "Update Photos" to be brought to a page where you can change, add, or remove pictures from your account.
