import DefaultButton from "./DefaultButton";
import { NavigateFunction } from "react-router";
import { createSearchParams } from "react-router-dom";

interface Props {
  navigate: NavigateFunction;
}

export default function SearchForm({ navigate }: Props) {
  const handleReset = () => {
    navigate("/questions", { replace: true, state: { needReload: true } });
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    const description = (
      form.elements.namedItem("description") as HTMLInputElement
    ).value;
    const tags = (form.elements.namedItem("tags") as HTMLInputElement).value;
    const early = (form.elements.namedItem("early") as HTMLInputElement).value;
    const late = (form.elements.namedItem("late") as HTMLInputElement).value;
    const order = (form.elements.namedItem("order") as HTMLInputElement).value;

    navigate({
      pathname: "/questions",
      search: createSearchParams({
        ...(title !== "" && { title: title }),
        ...(description !== "" && { description: description }),
        ...(tags !== "" && { tags: tags }),
        ...(early !== "" && { early: `${new Date(early).getTime()}` }),
        ...(late !== "" && { late: `${new Date(late).getTime()}` }),
        ...(order !== "" && { order: order }),
      }).toString(),
    });
  };

  return (
    <form
      className="ml-0 p-0 items-start flex flex-col gap-2"
      onSubmit={handleSearch}
    >
      <div className="flex flex-row gap-2">
        <div>
          <input id="title" placeholder="title" type="text" />
        </div>
        <div>
          <input id="description" placeholder="description" type="text" />
        </div>
        <div>
          <input id="tags" placeholder="tags" type="text" />
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <div>
          <label>early: </label>
          <input id="early" type="datetime-local" />
        </div>
        <div>
          <label>late: </label>
          <input id="late" type="datetime-local" />
        </div>
        <div>
          <label htmlFor="order">order: </label>
          <select className="p-[0.7rem] rounded-lg" name="order" id="order">
            <option id="newest" value="newest">
              newest
            </option>
            <option id="active" value="active">
              active
            </option>
            <option id="unanswered" value="unanswered">
              unanswered
            </option>
          </select>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <input id="submit" type="submit" value="search" />
        <DefaultButton
          text="reset"
          className="bg-rose-700 hover:bg-rose-800"
          onClick={(e) => {
            e.preventDefault();
            handleReset();
          }}
        />
      </div>
    </form>
  );
}
