const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const { doc, setDoc, updateDoc, serverTimestamp } = require("firebase/firestore");
const fs = require("fs");

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: "test-rules-" + Date.now(),
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });
  
  const ctx = testEnv.authenticatedContext("4O6USW1YwXNx40iBgDeoP17FH2S2", { 
    email: "dreamsofocean2614@gmail.com", email_verified: true
  });
  const db = ctx.firestore();
  
  try {
    const d = doc(db, "stories", "4Cz3q6S1taTr4XmcKcZA");
    await updateDoc(d, {
      title: "Test",
      updatedAt: serverTimestamp()
    });
    console.log("SUCCESS");
  } catch(e) {
    console.log("FAIL:", e.message);
  }
}
run();
