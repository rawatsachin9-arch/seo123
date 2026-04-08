import axios from "axios";

export default function PageView({ page }) {
  if (!page) return <div style={{padding:40}}>Page not found.</div>;

  return (
    <div style={{maxWidth:860, margin:"0 auto", padding:40, fontFamily:"sans-serif"}}>
      <title>{page.title}</title>
      <meta name="description" content={page.meta} />
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/page/${slug}`);
    return { props: { page: res.data } };
  } catch {
    return { props: { page: null } };
  }
}
