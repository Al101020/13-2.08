// TODO: write code here

(async () => {
  const request = fetch('http://localhost:7070/index');

  const result = await request;

  const text = await result.text();

  console.log(result);
  console.log(text);
})();
