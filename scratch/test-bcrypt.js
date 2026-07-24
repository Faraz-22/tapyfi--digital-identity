import bcrypt from "bcryptjs";

const hashFromSeed = "$2a$10$UnXh/U99y903F2tq9.iRzeFqI/FmFshJ6tZ.a6zP1u3K.3QnCOV4C";
const password = "password123";

async function run() {
  try {
    const isMatched = await bcrypt.compare(password, hashFromSeed);
    console.log("Match check against seed hash:", isMatched);

    const newHash = await bcrypt.hash(password, 10);
    console.log("New generated hash:", newHash);
    
    const isNewMatched = await bcrypt.compare(password, newHash);
    console.log("Match check against new hash:", isNewMatched);
  } catch (error) {
    console.error("Bcrypt comparison error:", error);
  }
}

run();
