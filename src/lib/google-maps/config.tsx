import { APIProvider } from "@vis.gl/react-google-maps";

export const GOOGLE_MAPS_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_ID}
      language="pt-BR"
      region="BR"
      libraries={["places", "marker"]}
    >
      {children}
    </APIProvider>
  );
}
