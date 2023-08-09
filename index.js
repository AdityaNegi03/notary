const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;


const db = mysql.createConnection({
  host: '',
  user: 'notaryadmin',     
  password: 'notaryadmin',  
  database: 'notary', 
});


db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/status/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `SELECT * FROM user WHERE uid = ?`;
  

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (results.length > 0) {

        const query2 = `SELECT * FROM candidate WHERE uid = ?`
        
        db.query(query2,[userId],(err, results2) => {
          if (err) {
            console.error('Error querying 2 MySQL:', err);
            res.status(500).json({ error: 'Internal server error' });
          }
          else{
            if (results2.length == 0)
            {
              res.json({uid: [userId],
                        candidates: 0,
                        joined:0,
                        interview:0
              })
            }
            else{
              const joinedQuery = `
                 SELECT *
                 FROM status s 
                 JOIN candidate c ON s.cid = c.cid
                 WHERE s.status = 'joined'
                 `;

const interviewQuery = `
  SELECT *
  FROM status s 
  JOIN candidate c ON s.cid = c.cid
  WHERE s.status = 'interview'
`;

Promise.all([
  new Promise((resolve, reject) => {
    db.query(joinedQuery, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.length);
      }
    });
  }),
  new Promise((resolve, reject) => {
    db.query(interviewQuery, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.length);
      }
    });
  })
])
  .then(([joinedCount, interviewCount]) => {
    res.json({
      uid: [userId],
      TotalCandidates: results2.length,
      joined: joinedCount,
      interview: interviewCount
    });
  })
  .catch(err => {
    console.error('Error querying MySQL:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

              
            }
          }
        } )

      } else {
        res.status(404).json({ error: 'Candidate not found' });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
