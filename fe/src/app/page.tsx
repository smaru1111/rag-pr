export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hello`);
  const data = await res.json();

  return (
    <div>
      {data.message}
    </div>
  );
}
