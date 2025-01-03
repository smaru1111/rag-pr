export async function GET(request: Request) {
  console.log(request);
  
  return new Response(JSON.stringify({ message: 'Hello, App Router API!' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
