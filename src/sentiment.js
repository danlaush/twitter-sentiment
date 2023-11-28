import { Ai } from '@cloudflare/ai'


export default async function analyzeContent(env, content) {
    console.log('[debug] analyzeContent()')
	const ai = new Ai(env.AI);

    // Shuffles the array of content and takes 30 elements to analyze. Just to
    // keep processing time under control.
    const toAnalyze = shuffle(content).slice(0, 30)

    try {
        const analyzed = await Promise.all(toAnalyze.map(comment => {
            return ai.run('@cf/huggingface/distilbert-sst-2-int8', {
                text: comment
            }).then(res => restructureSentiment(res, comment))
        }))
        
        return analyzed;
    } catch (error) {
        console.log('Failed to analyze content', error)
        throw new AnalysisError(error)
    }
}

class AnalysisError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "AnalysisError"; // (2)
    }
  }

function restructureSentiment([neg, pos], comment) {
    if(neg.score > pos.score) {
        return {
            text: comment,
            sentiment: 'NEGATIVE',
            score: neg.score
        }
    } else {
        return {
            text: comment,
            sentiment: 'POSITIVE',
            score: pos.score
        }
    }
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
