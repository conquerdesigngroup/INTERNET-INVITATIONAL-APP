import { NavLink, Navigate, useParams } from "react-router-dom";
import { SecHead } from "../components";
import TeamStats from "./stats/TeamStats";
import PlayerStats from "./stats/PlayerStats";
import CourseView from "./stats/CourseView";

const VIEWS = [
  { id: "teams", label: "Teams", title: "How Day 1 played out", text: "The running score, each format, and every margin. Switch contests and views with the buttons on each chart." },
  { id: "players", label: "Players", title: "Player stats", text: "Who carried their pairing, which partnerships clicked, and whether handicaps told the story." },
  { id: "course", label: "Course", title: "The course", text: "Ozarks National at Big Cedar Lodge, hole by hole, and where the resort's courses sit." },
];

export default function Stats() {
  const { view = "teams" } = useParams();
  const cur = VIEWS.find((v) => v.id === view);
  if (!cur) return <Navigate to="/stats" replace />;
  return (
    <section className="view">
      <SecHead title={cur.title}>{cur.text}</SecHead>
      <nav className="subtabs" aria-label="Stats views">
        {VIEWS.map((v) => (
          <NavLink key={v.id} to={v.id === "teams" ? "/stats" : `/stats/${v.id}`} end className="subtab" replace>
            {v.label}
          </NavLink>
        ))}
      </nav>
      {view === "teams" && <TeamStats />}
      {view === "players" && <PlayerStats />}
      {view === "course" && <CourseView />}
    </section>
  );
}
