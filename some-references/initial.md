## 1. Create Repo at Github

- Many setups are available, but at the start, do the following:
  - Create a new repository at Github, and name it "some-repo-name"
  - Do not initialize the repository with a README, .gitignore, or license
  - Click "Create Repository"
- Add gitignore file (the very first file so that subsequent commits will not include unwanted files)
  - Click "Add file" > "Create new file"
  - Name the file ".gitignore"
  - Add the following content to the file:

    ```
    # Ignore node_modules
    node_modules/

    # Ignore build output
    dist/

    # Ignore environment variables
    .env

    # Ignore log files
    *.log
    ```

  - Scroll and click "Commit new file"

## 2. Clone the Repository to Local Machine (GitHub Desktop)

- Open GitHub Desktop
- Click "File" > "Clone Repository"
- Select the repository you just created from the list
- Choose a local path where you want to clone the repository
- Click "Clone"

## 3. Install dependencies or devdependencies

- Either install dependencies one by one using npm i <dependency-name> or install all dependencies at once using npm i
- If you have a package.json file with all dependencies listed.

## Z. Try Gemini AI API

- at .env file, add the following line:

```
GEMINI_API_KEY=your_api_key_here
```

- npm install @google/genai

- the following code snippet is an example of how to use the Gemini AI API in your project:

```javascript
import { GoogleGenAI } from "@google/genai";

// Initialize with your API Key from your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getSurveyInsights = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // 1. Fetch your aggregated survey results (from your existing logic)
    const results = await fetchSurveyData(surveyId);

    // 2. Prepare the prompt
    const prompt = `
      You are a data analyst. Below are survey results in JSON format. 
      Analyze the trends, summarize text feedback, and provide 3 actionable 
      recommendations for the host based on the context of the survey results. 
      JSON: ${JSON.stringify(results)}
    `;

    // 3. Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using a fast, cost-effective model
      contents: prompt,
    });

    return res.json({
      status: "ok",
      insights: response.text(),
    });
  } catch (error) {
    return res.status(500).json({ msg: "AI analysis failed" });
  }
};
```
