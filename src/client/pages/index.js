import Head from "next/head";
import Dashboard from "../components/Dashboard.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Node Versions</title>
        <meta name="description" content="Node Versions" />
      </Head>

      <Dashboard />
    </>
  )
}
