import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <img
            src="/img/professor_hog.png"
            alt="Professor hog"
            className={styles.hedgehog}
            style={{ width: "120px", height: "auto" }}
          />
          <div>
            <Heading as="h1" className={styles.heroTitle}>
              Debug production errors with PostHog MCP
            </Heading>
            <p className={styles.heroSubtitle}>
              Learn how to debug production errors using PostHog's MCP server
            </p>
          </div>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/mcp-tutorial/"
          >
            Start Tutorial →
          </Link>
        </div>

        <div className={styles.quickStats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>~45 min</div>
            <div className={styles.statLabel}>To complete</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>7 modules</div>
            <div className={styles.statLabel}>Tutorial</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>Intermediate</div>
            <div className={styles.statLabel}>Difficulty level</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="PostHog MCP Tutorial"
      description="Learn how to build error monitoring tools using PostHog's Model Context Protocol server"
    >
      <HomepageHeader />
    </Layout>
  );
}
