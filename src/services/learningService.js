// src/services/learningService.js

const learningRepository = require("../repositories/learningRepository");
const {
  requireAdmin,
  requireMember
} = require("../utils/authorizationHelpers");
const {
  validateModule,
  validateLesson
} = require("../validators/learningValidator");

// ── Helper: verify module belongs to team ─────────────────────
async function requireValidModule(moduleId, teamId) {
  const module = await learningRepository.getModuleById(moduleId);
  if (!module) {
    throw { status: 404, message: "Module not found." };
  }
  if (module.team_id !== teamId) {
    throw { status: 403, message: "Module does not belong to this team." };
  }
  return module;
}

// ── Learning Modules ──────────────────────────────────────────

async function getModules(teamId, requesterId) {
  await requireMember(requesterId, teamId);
  return await learningRepository.getModulesByTeamId(teamId);
}

async function getModuleById(teamId, moduleId, requesterId) {
  await requireMember(requesterId, teamId);
  return await requireValidModule(moduleId, teamId);
}

async function getModuleWithLessons(teamId, moduleId, requesterId) {
  await requireMember(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  return await learningRepository.getModuleWithLessons(moduleId);
}

async function createModule(teamId, requesterId, title, description) {
  await requireAdmin(requesterId, teamId);
  const errors = validateModule(title);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }
  return await learningRepository.createModule(teamId, title, description);
}

async function updateModule(teamId, moduleId, requesterId, title, description) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  const errors = validateModule(title);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }
  return await learningRepository.updateModule(moduleId, title, description);
}

async function deleteModule(teamId, moduleId, requesterId) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);
  return await learningRepository.deleteModule(moduleId);
}

// ── Lessons ───────────────────────────────────────────────────

async function createLesson(teamId, moduleId, requesterId, title, content, orderIndex) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);

  const errors = validateLesson(title);
  if (errors.length > 0) {
    throw { status: 400, message: errors.join(", ") };
  }

  // Determine order_index
  let targetIndex;
  if (orderIndex !== undefined && orderIndex !== null) {
    // Insert at specific position — shift existing lessons up
    await learningRepository.shiftLessonsUp(moduleId, orderIndex);
    targetIndex = orderIndex;
  } else {
    // Append to end — get current max and add 1
    const maxIndex = await learningRepository.getMaxOrderIndex(moduleId);
    targetIndex = maxIndex + 1;
  }

  return await learningRepository.createLesson(
    moduleId, title, content, targetIndex
  );
}

async function updateLesson(teamId, moduleId, lessonId, requesterId, updates) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);

  const lesson = await learningRepository.getLessonById(lessonId);
  if (!lesson) {
    throw { status: 404, message: "Lesson not found." };
  }
  if (lesson.module_id !== moduleId) {
    throw { status: 403, message: "Lesson does not belong to this module." };
  }

  if (updates.title) {
    const errors = validateLesson(updates.title);
    if (errors.length > 0) {
      throw { status: 400, message: errors.join(", ") };
    }
  }

  return await learningRepository.updateLesson(lessonId, updates);
}

async function deleteLesson(teamId, moduleId, lessonId, requesterId) {
  await requireAdmin(requesterId, teamId);
  await requireValidModule(moduleId, teamId);

  const lesson = await learningRepository.getLessonById(lessonId);
  if (!lesson) {
    throw { status: 404, message: "Lesson not found." };
  }
  if (lesson.module_id !== moduleId) {
    throw { status: 403, message: "Lesson does not belong to this module." };
  }

  const deleted = await learningRepository.deleteLesson(lessonId);

  // Fill the gap left by deletion — shift remaining lessons down
  await learningRepository.shiftLessonsDown(moduleId, deleted.order_index);

  return deleted;
}

module.exports = {
  getModules,
  getModuleById,
  getModuleWithLessons,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson
};