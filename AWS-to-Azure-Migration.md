# AWS → Azure Migration Guide

This document describes how to migrate the current backend from AWS to Azure. It covers current AWS usage, Azure service mappings, step-by-step migration, code changes, environment variables, cost/performance notes, validation, and rollback.

## Scope and Goals

- Migrate compute, storage, registry, DNS, and logging from AWS to Azure with minimum app changes.
- Preserve project storage semantics (POSIX-like shared filesystem) and artifact handling.
- Keep similar performance and predictable costs; enable observability and security baselines.

---

## Current AWS Usage (as-is)

- Compute & Orchestration
  - ECS Fargate tasks defined in `aws/ecs-task-definition.json` and `aws/ecs-task-definition-old-project.json` (1 vCPU / 3 GiB).
  - App logic uses `@aws-sdk/client-ecs` to run, describe, list, stop tasks, and ECS Exec.

- Storage
  - EFS volume mounted into containers at `/app/project` (see EFS setup script `aws/efs-setup.sh`).
  - S3 used for templates, CLI artifacts, screenshots, and backups (`EFSBackupService`).

- Networking & DNS
  - awsvpc networking per task.
  - Route 53 for DNS records (planned/partial integration).

- Registry & Images
  - ECR for container images referenced in task definitions.

- Logging & Observability
  - CloudWatch Logs via `awslogs` driver in task definitions.

- Environment variables (validated in `src/app.module.ts`, loaded by `src/config/configuration.ts`)
  - Core AWS: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
  - ECS: `AWS_ECS_CLUSTER_NAME`, `AWS_ECS_TASK_DEFINITION_ARN`, `AWS_ECS_OLD_PROJECT_TASK_DEFINITION_ARN`
  - Network: `AWS_SUBNET_ID`, `AWS_SECURITY_GROUP_ID`
  - DNS: `AWS_HOSTED_ZONE_ID`, `AWS_DOMAIN_NAME`
  - Storage: `AWS_EFS_FILE_SYSTEM_ID`, `AWS_EFS_ACCESS_POINT_ID`, `EFS_MOUNT_PATH`, `EFS_PROJECT_PATH`
  - Artifacts/Templates: `CLI_TOOL_S3_BUCKET`, `CLI_TOOL_S3_KEY`, `TEMPLATE_S3_BUCKET`, `TEMPLATE_S3_KEY`
  - Backups: `S3_BACKUP_BUCKET`

---

## Target Azure Architecture

- Compute
  - Azure Container Apps (ACA) for long-running services and event-driven containers.
  - Optionally Azure Container Apps Jobs for one-off task runs analogous to ECS RunTask.

- Storage
  - Azure Files (NFS) mounted into Container Apps for shared POSIX-like filesystem at `/app/project`.
  - Azure Blob Storage for templates, CLI artifacts, backups, and generated assets.

- DNS
  - Azure DNS as authoritative zone for `AWS_DOMAIN_NAME` equivalent (e.g., `prettyai.dev`).

- Registry
  - Azure Container Registry (ACR) hosts application images.

- Logging/Monitoring
  - Azure Monitor and Log Analytics for container logs and metrics.

---

## Service Mapping

- ECS Fargate → Azure Container Apps (or ACA Jobs for ad-hoc runs)
- ECR → Azure Container Registry (ACR)
- EFS → Azure Files (prefer NFS for Linux containers)
- S3 → Azure Blob Storage (Block Blobs)
- Route 53 → Azure DNS
- CloudWatch Logs → Azure Monitor / Log Analytics

Notes:

- If interactive container exec is hard requirement, consider AKS. For ACA, implement internal command endpoints or sidecar approaches.

---

## Migration Steps

### 1) Prepare Azure Resources

1. Resource Group and Region
   - Create a dedicated resource group and select a region close to `AWS_REGION` for latency parity.

2. Container Registry (ACR)
   - Create ACR (Standard SKU) and enable admin or use Managed Identity for pulls.

3. Storage
   - Create Azure Storage account.
   - Create Blob containers: `templates`, `cli-artifacts`, `backups`, `assets`.
   - Create Azure Files share with NFS (Linux) for project storage.

4. Networking and DNS
   - Create a VNet and subnets for Container Apps environment.
   - Create an Azure DNS zone for your domain (or plan zone migration from Route 53).

5. Observability
   - Create a Log Analytics Workspace for container logs.
