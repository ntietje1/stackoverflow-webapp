import Content from "./ContentRouter";
import { BrowserRouter } from "react-router-dom";

export default function FakeStackOverflow() {
  return (
    <BrowserRouter basename="/">
      <Content />
    </BrowserRouter>
  );
}
