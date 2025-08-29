import { Observable } from "rxjs";

export const eventStream = new Observable<any>((subscriber) => {
  const es = new EventSource("http://localhost:4000/sse/events");

  es.onmessage = (event) => {
    console.log("Received SSE:", event.data);
    subscriber.next(JSON.parse(event.data));
  };

  es.onerror = (err) => {
    subscriber.error(err);
    es.close();
  };

  return () => es.close(); // cleanup when unsubscribed
});
