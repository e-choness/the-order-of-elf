using System.Collections;
using UnityEngine;
using UnityEngine.AI;
using static UnityEditor.VersionControl.Asset;

public class AIController : MonoBehaviour
{
    public enum AIType
    {
        Parent,
        Kid,
        Pet
    }

    public AIType aiType;

    public float movementSpeed;
    public float detectionRadius; // Larger radius for detection
    public float alertRadius; // Smaller radius for alert
    public float detectionRadiusStart; // Larger radius for detection
    public float alertRadiusStart; // Smaller radius for alert
    public float followDuration = 5f;
    public float idleAtLastSeenDuration = 3f;
    public float wanderRadius;

    public GameObject sanded;
    public GameObject detectionRadiusIndicator;

    private enum State
    {
        Patrol,
        Follow,
        Alert,
        Reset // New state for reset behavior
    }

    [SerializeField] private State currentState = State.Patrol;

    public Transform playerTransform;
    private NavMeshAgent agent;
    private bool isPlayerDetected = false;
    private bool isPlayerAlerted = false;
    private Vector3 lastSeenPlayerPosition;
    private float idleTimer = 0f;
    public PlayerScript player; // Assuming Player is a script that holds player-specific data

    public float idleDuration = 3f; // Time to idle at each patrol point

    private Vector3 patrolTarget;
    public bool isIdle = true;
    private bool activatedAlert;
    private Vector3 alertLocation;
    private bool isRespondingToAlert = false;
    private float resetTimer;
    public float resetDetectionCooldown = 5f;
    private float patrolTimer = 0f;
    public float patrolChangeInterval = 10f; // Time after which the patrol target changes

    private DetectionManager worldDetection;

    public Material normal;
    public Material follow;
    public Material alert;

    public Animator animator;

    void OnEnable()
    {
        detectionRadiusStart = detectionRadius;
        alertRadiusStart = alertRadius;
        agent = GetComponent<NavMeshAgent>();
        playerTransform = GameObject.FindGameObjectWithTag("Player").transform;
        player = playerTransform.GetComponent<PlayerScript>();
        agent.speed = movementSpeed;
        patrolTarget = patrolTarget = RandomNavmeshLocation();
        agent.SetDestination(patrolTarget);
        worldDetection = GameObject.FindGameObjectWithTag("WorldManager").GetComponent<DetectionManager>();

        NavMeshHit closestHit;

        if (NavMesh.SamplePosition(agent.transform.position, out closestHit, 500f, NavMesh.AllAreas))
        {
            agent.enabled = false;
            agent.transform.position = closestHit.position;
            agent.enabled = true;
        }
        Patrol();
        detectionRadiusIndicator.transform.localScale = new Vector3(detectionRadius, .001f, detectionRadius);
    }

    void Update()
    {
        if (player == null)
            player = playerTransform.GetComponent<PlayerScript>();
        if (currentState == State.Reset)
        {
            sanded.SetActive(true);
            agent.isStopped = true;
            animator.SetBool("IsStunned", true);
            animator.applyRootMotion = true;
            animator.SetBool("IsFollowing", false);
            animator.SetBool("IsAlert", false);
            animator.SetBool("IsPatrolling", false);
            animator.SetBool("IsIdle", false);
            resetTimer -= Time.deltaTime;
            if (resetTimer <= 0)
            {
                detectionRadiusIndicator.SetActive(true);
                sanded.SetActive(false);
                agent.isStopped = false;
                animator.applyRootMotion = false;
                animator.SetBool("IsStunned", false);
                animator.SetBool("IsFollowing", false);
                animator.SetBool("IsAlert", false);
                animator.SetBool("IsPatrolling", true);
                animator.SetBool("IsIdle", false);
                OnChangeState(State.Patrol); // Resume patrol after cooldown
            }
            else
            {
                return; // Skip detection and other behaviors during cooldown
            }
        }
        else
        {
            sanded.SetActive(false);
        }

        detectionRadiusIndicator.transform.localScale = new Vector3(detectionRadius, .001f, detectionRadius);

        if (player.controller.Movement.IsCrouching)
        {
            detectionRadius = detectionRadiusStart / 2;
            alertRadius = alertRadiusStart / 2;
        }
        else
        {
            detectionRadius = detectionRadiusStart;
            alertRadius = alertRadiusStart;
        }
        float distanceToPlayer = Vector3.Distance(transform.position, playerTransform.position);

        // Check for player detection
        if (distanceToPlayer <= detectionRadius && !player.isHidden)
        {
            isPlayerDetected = true;
            lastSeenPlayerPosition = playerTransform.position;
        }
        else
        {
            isPlayerDetected = false;
        }

        if (isPlayerDetected && !isPlayerAlerted)
        {
            OnChangeState(State.Follow);
            Follow();
            agent.isStopped = false;
            agent.destination = lastSeenPlayerPosition;
        }
        if (!isPlayerDetected)
        {
            OnChangeState(State.Patrol);
            agent.isStopped = false;
            Patrol();
        }
        else
        {
            if (distanceToPlayer > alertRadius)
            {
                isPlayerAlerted = false;
            }
            // Check for player alert
            if (distanceToPlayer <= alertRadius && !player.isHidden)
            {
                isPlayerAlerted = true;
            }
            else
            {
                isPlayerAlerted = false;
            }

            if (isPlayerAlerted && (distanceToPlayer > detectionRadius || player.isHidden))
            {
                // Player has escaped or is hidden, move to last seen position
                OnChangeState(State.Follow);
                Follow();
                agent.SetDestination(lastSeenPlayerPosition);
                isPlayerAlerted = false;
                idleTimer = idleAtLastSeenDuration;
            }
            if (isPlayerDetected && isPlayerAlerted)
            {
                OnChangeState(State.Alert);
                Alert();
                agent.isStopped = false;
                agent.destination = playerTransform.position;
            }

            if (isRespondingToAlert)
            {
                if (Vector3.Distance(transform.position, alertLocation) < 1f)
                {
                    // Check for player's presence
                    float distanceToPlayerAlert = Vector3.Distance(transform.position, playerTransform.position);
                    if (distanceToPlayerAlert <= detectionRadius && !player.isHidden)
                    {
                        // Player is within detection radius and not hidden
                        OnChangeState(State.Follow);
                        Follow();// Start following the player
                        isRespondingToAlert = false; // Reset alert state
                    }
                    else if (distanceToPlayerAlert <= alertRadius && !player.isHidden)
                    {
                        // Player is within alert radius and not hidden
                        OnChangeState(State.Alert);
                        Alert();// Go into alert state
                        isRespondingToAlert = false; // Reset alert state
                    }
                    else
                    {
                        // Player is not detected
                        OnChangeState(State.Follow);
                        Follow();// Go back to patrol
                        isRespondingToAlert = false; // Reset alert state
                    }
                }
            }
        }

        if (isIdle)
        {
            agent.isStopped = true;
            animator.SetBool("IsFollowing", false);
            animator.SetBool("IsAlert", false);
            animator.SetBool("IsPatrolling", false);
            animator.SetBool("IsIdle", true);
        }
        else
        {
            agent.isStopped = false;
        }

        if (resetTimer <= (0 - (idleTimer + 5)))
        {
            activatedAlert = false;
        }
    }

    void CheckStates()
    {
        animator.SetBool("IsFollowing", false);
        animator.SetBool("IsAlert", false);
        animator.SetBool("IsPatrolling", true);
        animator.SetBool("IsIdle", false);
    }

    void OnChangeState(State newState)
    {
        if (currentState != newState)
        {
            switch (newState)
            {
                case State.Reset:
                    // Additional logic when entering reset state if needed
                    break;
                case State.Patrol:
                case State.Follow:
                case State.Alert:
                    // Logic for other states
                    break;
            }

            if (newState == State.Alert)
                worldDetection.RegisterDetection();
            else
                worldDetection.DeregisterDetection();

            // Reset all animation states
            animator.SetBool("IsFollowing", newState == State.Follow);
            animator.SetBool("IsAlert", newState == State.Alert);
            animator.SetBool("IsPatrolling", newState == State.Patrol);
            animator.SetBool("IsIdle", false); // Make sure to set IsIdle to false when changing state

            currentState = newState;
        }
        currentState = newState;
    }

    void NotifyOtherAIs()
    {
        alertLocation = transform.position; // The pet's current position is the alert location

        AIController[] allAIs = FindObjectsOfType<AIController>();
        foreach (var ai in allAIs)
        {
            if (ai != this && (ai.aiType == AIType.Parent || ai.aiType == AIType.Kid))
            {
                ai.RespondToAlert(alertLocation);
            }
        }
    }

    public void RespondToAlert(Vector3 location)
    {
        if (aiType == AIType.Parent || aiType == AIType.Kid)
        {
            alertLocation = location;
            isRespondingToAlert = true;
            agent.SetDestination(alertLocation);
        }
    }

    void Patrol()
    {
        if (currentState == State.Reset) return;
        detectionRadiusIndicator.GetComponent<MeshRenderer>().material = normal;
        agent.speed = 1f;
        CheckStates();
        patrolTimer += Time.deltaTime;

        if (patrolTimer >= patrolChangeInterval)
        {
            // Time to choose a new patrol target
            patrolTarget = RandomNavmeshLocation();
            isIdle = false; // Reset idle state to start moving towards the new target
            patrolTimer = 0f; // Reset the patrol timer
        }

        if (!isIdle)
        {
            if (Vector3.Distance(transform.position, patrolTarget) < 1f)
            {
                // Start idling
                isIdle = true;
                idleTimer = idleDuration;
            }
            else
            {
                // Move to patrol target
                agent.SetDestination(patrolTarget);
            }
        }
        else
        {
            idleTimer -= Time.deltaTime;
            if (idleTimer <= 0)
            {
                // Finished idling, choose a new patrol point
                patrolTarget = RandomNavmeshLocation();
                isIdle = false;
                patrolTimer = 0f; // Reset the patrol timer
            }
        }
    }

    Vector3 RandomNavmeshLocation()
    {
        Vector3 randomDirection = Random.insideUnitSphere * wanderRadius;
        randomDirection += transform.position;
        NavMeshHit hit;
        Vector3 finalPosition = Vector3.zero;

        // Attempt to find a random point on the NavMesh within wanderRadius.
        if (NavMesh.SamplePosition(randomDirection, out hit, wanderRadius, NavMesh.AllAreas))
        {
            finalPosition = hit.position;
        }
        else
        {
            // If a point on the NavMesh is not found, find the nearest point on the NavMesh.
            if (NavMesh.FindClosestEdge(transform.position, out hit, NavMesh.AllAreas))
            {
                finalPosition = hit.position;
            }
        }

        return finalPosition;
    }

    void Follow()
    {
        if (currentState == State.Reset) return;
        detectionRadiusIndicator.GetComponent<MeshRenderer>().material = follow;
        agent.speed = 2f;
        if (isPlayerDetected)
        {
            agent.SetDestination(playerTransform.position);
        }
        else
        {
            OnChangeState(State.Patrol);
            Patrol();
        }
        //if (Vector3.Distance(transform.position, lastSeenPlayerPosition) < 1f && !activatedAlert && !isIdle)
        //{
        //    isIdle = true;
        //    activatedAlert = true;
        //}
        //if (isIdle && activatedAlert)
        //{
        //    idleTimer = idleDuration;
        //    resetTimer = idleDuration + 5;
        //    idleTimer -= Time.deltaTime;
        //    resetTimer -= Time.deltaTime;
        //    if (idleTimer <= 0)
        //    {
        //        isIdle = false;
        //        animator.SetBool("IsFollowing", true);
        //        animator.SetBool("IsAlert", false);
        //        animator.SetBool("IsPatrolling", false);
        //        animator.SetBool("IsIdle", false);
        //    }
        //}
    }

    void Alert()
    {
        if (currentState == State.Reset) return;
        detectionRadiusIndicator.GetComponent<MeshRenderer>().material = alert;
        agent.speed = 3f;
        if (aiType == AIType.Pet)
        {
            NotifyOtherAIs();
        }

        if (Vector3.Distance(transform.position, playerTransform.position) < .2f)
        {
            agent.SetDestination(transform.position);
            animator.SetBool("IsFollowing", false);
            animator.SetBool("IsAlert", false);
            animator.SetBool("IsPatrolling", false);
            animator.SetBool("IsIdle", true);
        }
        else
        {
            agent.SetDestination(playerTransform.position);
            animator.SetBool("IsFollowing", false);
            animator.SetBool("IsAlert", true);
            animator.SetBool("IsPatrolling", false);
            animator.SetBool("IsIdle", false);
        }
    }

    public void ResetDetection()
    {
        OnChangeState(State.Reset);
        detectionRadiusIndicator.SetActive(false);
        isPlayerDetected = false;
        resetTimer = resetDetectionCooldown;
    }
}
