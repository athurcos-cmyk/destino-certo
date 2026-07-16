import { APIProvider } from "@vis.gl/react-google-maps";

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!key && typeof window !== "undefined") {
  throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
}
export const GOOGLE_MAPS_ID = key || "";

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  if (!key) {
    return <>{children}</>;
  }
  return (
    <APIProvider
      apiKey={key}
      language="pt-BR"
      region="BR"
      libraries={["places"]}
    >
      {children}
    </APIProvider>
  );
}
