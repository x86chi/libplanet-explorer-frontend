const pattern = /\w+\&/;

export default function getID(querystring: string) {
  const execed = pattern.exec(querystring);
  if (execed === null) return querystring;
  return execed[0].slice(0, -1);
}
