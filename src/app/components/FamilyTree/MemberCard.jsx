"use client";
import { useState, useEffect } from "react";
import styles from "../../styles/Family.module.css";

export default function MemberCard({
  member,
  onAddChild,
  onEdit,
  onDelete,
  isAdmin,
  isHighlighted,
  searchTerm,
  autoExpand,
}) {
  const hasChildren = member?.children?.length > 0;

  const [showChildren, setShowChildren] = useState(false);
  const [wasManuallyToggled, setWasManuallyToggled] = useState(false); // 👈

  // Auto-expand when searching or filtering
  useEffect(() => {
    if (autoExpand && (member.shouldExpand || isHighlighted(member))) {
      setShowChildren(true);
    } else if (autoExpand) {
      setShowChildren(true);
    }
  }, [autoExpand, member.shouldExpand, isHighlighted, member]);

  // Collapse only if no manual toggle
  useEffect(() => {
    if (!autoExpand && !wasManuallyToggled) {
      setShowChildren(false);
    }
  }, [autoExpand, wasManuallyToggled]);

  const toggleChildren = () => {
    if (hasChildren) {
      setShowChildren((prev) => !prev);
      setWasManuallyToggled(true); // ✅ Mark as manual
    }
  };

  const genderClass = member.gender === "female" ? styles.female : styles.male;
  const highlightClass = isHighlighted(member) ? styles.highlight : "";

  return (
    <div className={styles.memberWrapper}>
      <div
        className={`${styles.memberCard} ${genderClass} ${highlightClass}`}
        data-name={member.name}
        data-country={member.country}
      >
        <div className={styles.name}>{member.name}</div>
        {member.spouse && <div className={styles.spouse}><i>+ {member.spouse}</i></div>}
        <div>{member.email}</div>

        {member.name !== "Filtered Results" && (
          <>
            {member.generation !== 0  && <div className={styles.generationRow}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users w-3 h-3"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <div className={styles.meta}>
                <b>Gen {member.generation}</b>
              </div>
            </div>}
            {member.country && (
              <div className={styles.metaRow}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2c2.5 2 4 6 4 10s-1.5 8-4 10c-2.5-2-4-6-4-10s1.5-8 4-10z" />
                </svg>

                <b>{member.country}</b>
              </div>
            )}
            {member.city && (
              <div className={styles.metaRow}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 22V10l6-5 6 5v12H3zM21 22h-4V12h4v10z" />
                </svg>

                <b>{member.city}</b>
              </div>
            )}
            {(member.id === "V.1") ? (
              <div className={styles.meta} style={{ visibility: "hidden" }}>
                <b>0 Children</b>
              </div>
            ) : (
              <div className={styles.meta}>
                <b>
                  {hasChildren
                    ? `${member.children.length} ${member.children.length === 1 ? "Child" : "Children"
                    }`
                    : <span>&nbsp;</span>}
                </b>
              </div>
            )}

            {/* {member.name !== "Panamthottam" && (
              <div className={styles.meta}>
                <b>Father - {member.father ?? ""}</b>
              </div>
            )} */}
          </>
        )}

        {isAdmin && member.name !== "Filtered Results" && (
          <div className={styles.buttonContainer}>
            {member.id !== "V.1" && (
              <>
                <button onClick={() => onAddChild(member)}>Add Child</button>
                <button onClick={() => onEdit(member)}>Edit</button>
                <button onClick={() => onDelete(member.id)}>Delete</button>
              </>
            )}
          </div>
        )}


        {hasChildren && (
          <button className={styles.toggleBtn} onClick={toggleChildren}>
            {showChildren ? "▲ Hide" : "▼ Show"}
          </button>
        )}
      </div>

      {/* {hasChildren && showChildren && (
        <div className={styles.children}>
          {member.children.map((child, index) => (
            <div key={index} className={styles.childWrapper}>
              <MemberCard
                member={child}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
                isHighlighted={isHighlighted}
                searchTerm={searchTerm}
                autoExpand={autoExpand}
              />
            </div>
          ))}
        </div>
      )} */}

      {hasChildren && showChildren && (
        <>
          {member.children.length > 1 && (
            <div className={styles.verticalLineWithArrow}></div>
          )}
          <div
            className={`${styles.children} ${member.children.length === 1 ? styles.singleOnlyChild : ""
              }`}
          >
            {member.children.map((child, index) => (
              <div
                key={index}
                className={`${styles.childWrapper} ${member.children.length === 1 ? styles.singleOnlyChild : ""
                  }`}
              >
                <span className={styles.downArrow}></span>
                <MemberCard
                  member={child}
                  onAddChild={onAddChild}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isAdmin={isAdmin}
                  isHighlighted={isHighlighted}
                  searchTerm={searchTerm}
                  autoExpand={autoExpand}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
