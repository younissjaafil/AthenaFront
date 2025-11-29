"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glassEffect?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = true,
  glassEffect = false,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={
        hoverEffect
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-border-light dark:border-gray-800 p-6 transition-shadow duration-200",
        hoverEffect && "hover:shadow-lg hover:shadow-brand-purple-500/10",
        glassEffect
          ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md"
          : "bg-white dark:bg-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for lists of cards
export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual item for stagger animation
export function StaggerItem({
  children,
  className,
  hoverEffect = true,
}: {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={
        hoverEffect
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-border-light dark:border-gray-800 p-6 bg-white dark:bg-gray-900 transition-shadow duration-200",
        hoverEffect && "hover:shadow-lg hover:shadow-brand-purple-500/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Stats card with animation
export function StatsCard({
  title,
  value,
  change,
  icon,
  delay = 0,
  colorClass = "text-brand-purple-600 dark:text-brand-purple-400",
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  delay?: number;
  colorClass?: string;
}) {
  return (
    <AnimatedCard delay={delay} className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
        className={cn("text-3xl font-bold", colorClass)}
      >
        {value}
      </motion.p>
      {change && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {change}
        </p>
      )}
      {/* Decorative gradient */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-brand-purple-500/10 to-brand-teal-500/10 blur-2xl" />
    </AnimatedCard>
  );
}
